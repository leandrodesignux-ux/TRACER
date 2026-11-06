import type { DataSource } from "@/lib/ai/tools";
import type { SourceId } from "@/lib/data/types";

export function findSource(
  source: DataSource | DataSource[],
  id: SourceId,
) {
  const sources = Array.isArray(source) ? source : [source];
  return sources.find((item) => item.id === id) ?? sources[0]!;
}
