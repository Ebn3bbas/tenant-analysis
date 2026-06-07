import { createParser, useQueryState } from "nuqs";
import type { SortingState } from "@tanstack/react-table";

const sortingParser = createParser<SortingState>({
  serialize(value) {
    return value.map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`).join(",");
  },
  parse(query) {
    if (!query) return [];
    return query
      .split(",")
      .map((s) => {
        const [id, dir] = s.split(":");
        if (!id || !dir || !["asc", "desc"].includes(dir)) return null;
        return { id, desc: dir === "desc" };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
  },
});

export function useUrlSorting() {
  return useQueryState("sort", sortingParser.withDefault([]));
}
