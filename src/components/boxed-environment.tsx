"use client";

import { cva, type VariantProps } from "class-variance-authority";
import katex from "katex";
import {
  BookMarked,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  Search,
  TriangleAlert,
} from "lucide-react";
import type { MDXComponents } from "mdx/types";
import { type ReactNode, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const PRIME_MODULUS = 997;

type BoxedEnvironmentProps = {
  children?: string | ReactNode;
  latex?: string;
  title?: string;
  subtitle?: string;
  caption?: string;
  id?: string;
  number?: number;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
} & VariantProps<typeof boxedEnvironmentVariants>;

const VARIANT = {
  theorem: {
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-700",
    bg: "bg-blue-50/80 dark:bg-blue-950/40",
    shadow: "shadow-md shadow-blue-200/60 dark:shadow-blue-900/40",
  },
  proof: {
    text: "text-green-700 dark:text-green-300",
    border: "border-green-300 dark:border-green-700",
    bg: "bg-green-50/80 dark:bg-green-950/40",
    shadow: "shadow-md shadow-green-200/60 dark:shadow-green-900/40",
  },
  definition: {
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-300 dark:border-purple-700",
    bg: "bg-purple-50/80 dark:bg-purple-950/40",
    shadow: "shadow-md shadow-purple-200/60 dark:shadow-purple-900/40",
  },
  example: {
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-300 dark:border-orange-700",
    bg: "bg-orange-50/80 dark:bg-orange-950/40",
    shadow: "shadow-md shadow-orange-200/60 dark:shadow-orange-900/40",
  },
  note: {
    text: "text-gray-700 dark:text-gray-300",
    border: "border-gray-300 dark:border-gray-600",
    bg: "bg-gray-50/80 dark:bg-gray-900/40",
    shadow: "shadow-md shadow-gray-200/60 dark:shadow-gray-800/40",
  },
  warning: {
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-300 dark:border-yellow-700",
    bg: "bg-yellow-50/80 dark:bg-yellow-950/40",
    shadow: "shadow-md shadow-yellow-200/60 dark:shadow-yellow-900/40",
  },
  info: {
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-300 dark:border-cyan-700",
    bg: "bg-cyan-50/80 dark:bg-cyan-950/40",
    shadow: "shadow-md shadow-cyan-200/60 dark:shadow-cyan-900/40",
  },
} as const;

type VariantKey = keyof typeof VARIANT;
type VariantStyle = {
  text: string;
  border: string;
  bg: string;
  shadow: string;
};

function mapValues<T extends Record<string, U>, U, R>(
  obj: T,
  fn: (v: U) => R
): { [K in keyof T]: R } {
  const out = {} as { [K in keyof T]: R };
  for (const k of Object.keys(obj) as Array<keyof T>) {
    out[k] = fn(obj[k]);
  }
  return out;
}

const DEFAULT_VARIANT: VariantKey = "theorem";

const containerByVariant = mapValues(VARIANT, (v: VariantStyle) => [
  v.border,
  v.bg,
  v.shadow,
]);
const textByVariant = mapValues(VARIANT, (v: VariantStyle) => v.text);
const borderByVariant = mapValues(VARIANT, (v: VariantStyle) => v.border);
const iconContainerByVariant = mapValues(VARIANT, (v: VariantStyle) => [
  v.bg,
  v.border,
]);

const boxedEnvironmentVariants = cva(
  "my-4 rounded-lg border shadow-lg backdrop-blur-sm",
  {
    variants: {
      variant: containerByVariant,
    },
    defaultVariants: {
      variant: DEFAULT_VARIANT,
    },
  }
);

const titleVariants = cva(
  "!my-0 -mx-1 -my-0.5 cursor-pointer truncate rounded-sm px-1 py-0.5 text-start font-medium font-mono text-sm uppercase tracking-wide transition-all duration-200 hover:underline hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-current/20 focus:ring-offset-2 sm:text-base md:text-md",
  {
    variants: {
      variant: textByVariant,
    },
    defaultVariants: {
      variant: DEFAULT_VARIANT,
    },
  }
);

const iconVariants = cva("size-3.5 sm:size-4", {
  variants: {
    variant: textByVariant,
  },
  defaultVariants: {
    variant: DEFAULT_VARIANT,
  },
});

const iconContainerVariants = cva(
  "flex size-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 hover:scale-105 sm:size-6",
  {
    variants: {
      variant: iconContainerByVariant,
    },
    defaultVariants: {
      variant: DEFAULT_VARIANT,
    },
  }
);

const headerVariants = cva(
  "flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 sm:py-3.5",
  {
    variants: {
      variant: borderByVariant,
    },
    defaultVariants: {
      variant: DEFAULT_VARIANT,
    },
  }
);

const variantIcons = {
  theorem: BookOpen,
  proof: Search,
  definition: BookMarked,
  example: Lightbulb,
  note: BookOpen,
  warning: TriangleAlert,
  info: Info,
} as const;

const variantLabels: Record<
  NonNullable<BoxedEnvironmentProps["variant"]>,
  string
> = {
  theorem: "Theorem",
  proof: "Proof",
  definition: "Definition",
  example: "Example",
  note: "Note",
  warning: "Warning",
  info: "Info",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function BoxedEnvironment({
  children,
  latex,
  title,
  id,
  number,
  collapsible = false,
  defaultOpen = true,
  variant = "theorem",
  className = "",
}: BoxedEnvironmentProps) {
  const content = useMemo(() => {
    if (typeof latex === "string") {
      return latex;
    }
    if (typeof children === "string") {
      return children;
    }
    return "";
  }, [latex, children]);

  const renderedContent = useMemo(() => {
    if (!content) {
      return "";
    }
    return katex.renderToString(content, {
      displayMode: true,
      throwOnError: true,
      strict: false,
      trust: true,
      fleqn: true,
    });
  }, [content]);

  const label = variantLabels[variant ?? "theorem"];

  const computedId = useMemo(() => {
    if (id && id.trim().length > 0) {
      return id;
    }
    if (title && title.trim().length > 0) {
      return `${variant}-${slugify(title)}`;
    }
    return `${variant}-${Math.abs(content.length % PRIME_MODULUS)}`;
  }, [content, id, title, variant]);

  const [open, setOpen] = useState<boolean>(defaultOpen);

  async function handleCopy() {
    const { location } = window;
    const url = `${location.origin}${location.pathname}#${computedId}`;
    await navigator.clipboard.writeText(url);
  }

  const IconComponent = variantIcons[variant ?? "theorem"];

  return (
    <section
      className={cn(boxedEnvironmentVariants({ variant }), className)}
      id={computedId}
    >
      <header
        className={cn(
          headerVariants({ variant }),
          collapsible
            ? "place-items-center border-b transition-colors duration-300 ease-in-out"
            : null,
          collapsible && !open ? "border-transparent" : null
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className={iconContainerVariants({ variant })}>
            <IconComponent className={iconVariants({ variant })} />
          </div>
          <button
            className={cn(
              titleVariants({ variant }),
              "min-w-0 flex-1 text-left"
            )}
            onClick={handleCopy}
            type="button"
          >
            <span className="block truncate">
              {number != null ? `${label} ${number}` : label}
              {title ? `: ${title}` : null}
            </span>
          </button>
        </div>
        {collapsible ? (
          <button
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium text-xs transition-all duration-200 hover:scale-105 hover:bg-black/5 sm:text-sm dark:hover:bg-white/10"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            {open ? (
              <>
                <ChevronUp className="size-3.5 sm:size-4" />
                <span className="hidden sm:inline">Hide</span>
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5 sm:size-4" />
                <span className="hidden sm:inline">Show</span>
              </>
            )}
          </button>
        ) : null}
      </header>
      <div
        className={cn(
          "grid px-3 transition-[grid-template-rows] duration-300 ease-in-out sm:px-4",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "py-2 transition-opacity duration-200 sm:py-3",
              open ? "opacity-100" : "opacity-0"
            )}
          >
            <div
              className={cn("katex-display")}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: pass
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export const BoxedTheorem: MDXComponents["BoxedTheorem"] = (props) => (
  <BoxedEnvironment {...props} variant="theorem" />
);

export const BoxedProof: MDXComponents["BoxedProof"] = (props) => (
  <BoxedEnvironment {...props} variant="proof" />
);

export const BoxedDefinition: MDXComponents["BoxedDefinition"] = (props) => (
  <BoxedEnvironment {...props} variant="definition" />
);

export const BoxedExample: MDXComponents["BoxedExample"] = (props) => (
  <BoxedEnvironment {...props} variant="example" />
);

export const BoxedNote: MDXComponents["BoxedNote"] = (props) => (
  <BoxedEnvironment {...props} variant="note" />
);

export const BoxedWarning: MDXComponents["BoxedWarning"] = (props) => (
  <BoxedEnvironment {...props} variant="warning" />
);

export const BoxedInfo: MDXComponents["BoxedInfo"] = (props) => (
  <BoxedEnvironment {...props} variant="info" />
);
