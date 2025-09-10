import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import {
  BoxedDefinition,
  BoxedEnvironment,
  BoxedExample,
  BoxedInfo,
  BoxedNote,
  BoxedProof,
  BoxedTheorem,
  BoxedWarning,
} from "@/components/boxed-environment";
import { Mermaid } from "@/components/mermaid";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Mermaid,
    BoxedEnvironment,
    BoxedTheorem,
    BoxedProof,
    BoxedDefinition,
    BoxedExample,
    BoxedNote,
    BoxedWarning,
    BoxedInfo,
    ...components,
  };
}
