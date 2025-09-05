import type { Thing, WithContext } from "schema-dts";

type JsonLdProps = {
  data: WithContext<Thing>;
};

export function JsonLd(props: JsonLdProps) {
  return (
    <script suppressHydrationWarning type="application/ld+json">
      {JSON.stringify(props.data)}
    </script>
  );
}
