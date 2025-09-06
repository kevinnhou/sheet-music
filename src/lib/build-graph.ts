/** biome-ignore-all lint/performance/useTopLevelRegex: pass */

import type { Graph } from "@/components/graph-view";
import { source } from "@/lib/source";

function getModuleFromUrl(url: string): string | null {
  const match = url.match(/^\/(mod-\d+)/);
  return match ? match[1] : null;
}

export function buildGraph(): Graph {
  const pages = source.getPages();
  const graph: Graph = { links: [], nodes: [] };

  for (const page of pages) {
    if (page.url.startsWith("/core")) {
      continue;
    }

    if (page.url.match(/^\/mod-\d+$/)) {
      continue;
    }

    const module = getModuleFromUrl(page.url);

    graph.nodes.push({
      id: page.url,
      url: page.url,
      text: page.data.title,
      description: page.data.description,
      module,
    });

    const { extractedReferences = [] } = page.data;
    for (const ref of extractedReferences) {
      const refPage = source.getPageByHref(ref.href);
      if (!refPage) {
        continue;
      }

      if (refPage.page.url.startsWith("/core")) {
        continue;
      }

      graph.links.push({
        source: page.url,
        target: refPage.page.url,
      });
    }
  }

  return graph;
}
