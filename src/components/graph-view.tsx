// biome-ignore-all lint: pass

"use client";
import { forceCollide, forceLink, forceManyBody } from "d3-force";
import { useRouter } from "fumadocs-core/framework";
import {
  lazy,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ForceGraphMethods,
  ForceGraphProps,
  LinkObject,
  NodeObject,
} from "react-force-graph-2d";

export interface Graph {
  links: Link[];
  nodes: Node[];
}

export type Node = NodeObject<NodeType>;
export type Link = LinkObject<NodeType, LinkType>;

export type NodeType = {
  text: string;
  description?: string;
  neighbors?: string[];
  url: string;
  module?: string | null;
};
export type LinkType = Record<string, unknown>;

export interface GraphViewProps {
  graph: Graph;
}

const ForceGraph2D = lazy(
  () => import("react-force-graph-2d")
) as typeof import("react-force-graph-2d").default;

export function GraphView(props: GraphViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  useEffect(() => {
    setMount(true);
  }, []);

  return (
    <div
      className="relative h-[600px] overflow-hidden rounded-xl border [&_canvas]:size-full"
      ref={ref}
    >
      {mount && <ClientOnly {...props} containerRef={ref} />}
    </div>
  );
}

function ClientOnly({
  containerRef,
  graph: { nodes, links },
}: GraphViewProps & { containerRef: RefObject<HTMLDivElement | null> }) {
  const fgRef = useRef<ForceGraphMethods<Node, Link> | undefined>(undefined);
  const hoveredRef = useRef<Node | null>(null);
  const readyRef = useRef(false);
  const router = useRouter();
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
  } | null>(null);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) {
      return;
    }

    if (readyRef.current) {
      return;
    }
    readyRef.current = true;

    fg.d3Force("link", forceLink().distance(300));
    fg.d3Force("charge", forceManyBody().strength(10));
    fg.d3Force("collision", forceCollide(80));
  });

  const handleNodeHover = (node: Node | null) => {
    const graph = fgRef.current;
    if (!graph) return;
    hoveredRef.current = node;

    if (node) {
      const coords = graph.graph2ScreenCoords(node.x!, node.y!);
      setTooltip({
        x: coords.x + 4,
        y: coords.y + 4,
        content: node.description ?? "No description",
      });
    } else {
      setTooltip(null);
    }
  };

  // Custom node rendering: circle with text label below
  const nodeCanvasObject: ForceGraphProps["nodeCanvasObject"] = (node, ctx) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const style = getComputedStyle(container);
    const fontSize = 12;
    const radius = 6;

    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);

    const hoverNode = hoveredRef.current;
    const isActive =
      hoverNode?.id === node.id ||
      hoverNode?.neighbors?.includes(node.id as string);

    let nodeColor: string;
    if (isActive) {
      nodeColor = style.getPropertyValue("--color-fd-primary");
    } else if (node.module) {
      nodeColor = style.getPropertyValue(`--${node.module}-colour`);
    } else {
      nodeColor = style.getPropertyValue("--color-purple-300");
    }

    ctx.fillStyle = nodeColor;
    ctx.fill();

    // Draw text below the node
    ctx.font = `${fontSize}px Jetbrains Mono, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = getComputedStyle(container).getPropertyValue("color");
    ctx.fillText(node.text, node.x!, node.y! + radius + fontSize + 2);
  };

  const linkColor = (link: Link) => {
    const container = containerRef.current;
    if (!container) return "#999";
    const style = getComputedStyle(container);
    const hoverNode = hoveredRef.current;

    if (
      hoverNode &&
      typeof link.source === "object" &&
      typeof link.target === "object" &&
      (hoverNode.id === link.source.id || hoverNode.id === link.target.id)
    ) {
      return style.getPropertyValue("--color-fd-primary");
    }

    // Use module colour for links if both nodes are from the same module
    if (
      typeof link.source === "object" &&
      typeof link.target === "object" &&
      link.source.module &&
      link.target.module &&
      link.source.module === link.target.module
    ) {
      const moduleColor = style.getPropertyValue(
        `--${link.source.module}-colour`
      );
      return `color-mix(in oklab, ${moduleColor} 30%, transparent)`;
    }

    return `color-mix(in oklab, ${style.getPropertyValue("--color-fd-muted-foreground")} 50%, transparent)`;
  };

  // Enrich nodes with neighbors for hover effects
  const enrichedNodes = useMemo(() => {
    const enrichedNodes = nodes.map((node) => ({
      ...node,
      neighbors: links.flatMap((link) => {
        if (link.source === node.id) return link.target;
        if (link.target === node.id) return link.source;
        return [];
      }),
    }));

    return { nodes: enrichedNodes as NodeType[], links };
  }, [nodes, links]);

  return (
    <>
      <ForceGraph2D<NodeType, LinkType>
        enableNodeDrag
        enableZoomInteraction
        graphData={enrichedNodes}
        linkColor={linkColor}
        linkWidth={2}
        nodeCanvasObject={nodeCanvasObject}
        onNodeClick={(node) => {
          router.push(node.url);
        }}
        onNodeHover={handleNodeHover}
        ref={fgRef}
      />
      {tooltip && (
        <div
          className="absolute size-fit max-w-xs rounded-xl border bg-fd-popover p-3 text-fd-popover-foreground text-sm shadow-lg font-medium"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          {tooltip.content}
        </div>
      )}
    </>
  );
}
