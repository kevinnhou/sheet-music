import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { Metadata } from "next";
import { JsonLd } from "@/components/jsonld";
import { baseOptions } from "@/lib/layout.shared";
import { buildWebsiteJsonLd, siteMetadata } from "@/lib/seo";
import { source } from "@/lib/source";

import "katex/dist/katex.css";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions()}
      sidebar={{
        tabs: {
          transform(option, node) {
            const meta = source.getNodeMeta(node);
            if (!(meta && node.icon)) {
              return option;
            }

            const colour = `var(--${meta.path.split("/")[0]}-colour, var(--colour-fd-foreground))`;

            return {
              ...option,
              icon: (
                <div
                  className="size-full rounded-lg text-(--tab-colour) max-md:border max-md:bg-(--tab-colour)/10 max-md:p-1.5 [&_svg]:size-full"
                  style={
                    {
                      "--tab-colour": colour,
                    } as object
                  }
                >
                  {node.icon}
                </div>
              ),
            };
          },
        },
      }}
    >
      {children}
      <JsonLd data={buildWebsiteJsonLd()} />
    </DocsLayout>
  );
}

export const metadata: Metadata = siteMetadata;
