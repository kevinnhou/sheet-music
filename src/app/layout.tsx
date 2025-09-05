import "@/app/global.css";
import { RootProvider } from "fumadocs-ui/provider";
import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { JsonLd } from "@/components/jsonld";
import { buildWebsiteJsonLd, siteMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

const geist = Geist({
  subsets: ["latin"],
  display: "optional",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "optional",
});

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html
      className={cn("antialiased", geist.className, jetBrainsMono.variable)}
      lang="en-AU"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
        <JsonLd data={buildWebsiteJsonLd()} />
      </body>
    </html>
  );
}

export const metadata: Metadata = siteMetadata;
