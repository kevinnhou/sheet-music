import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      url: "/core",
      transparentMode: "top",
      title: (
        <div className="flex items-center gap-1 font-medium text-md text-muted-foreground/80 tracking-wider">
          [
          <span className="font-mono font-regular text-foreground italic tracking-tight">
            Sheet Music
          </span>
          ]
        </div>
      ),
    },
  };
}
