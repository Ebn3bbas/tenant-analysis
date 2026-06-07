import { parseAsString, useQueryState } from "nuqs";

export function useUrlFilter() {
  return useQueryState("q", parseAsString.withDefault(""));
}
