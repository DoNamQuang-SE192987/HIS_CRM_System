"use client";

import { useCallback, useMemo, useState } from "react";

/** Multi-row selection state for tables with checkboxes. */
export function useSelection<TId extends string>(visibleIds: TId[]) {
  const [selected, setSelected] = useState<Set<TId>>(() => new Set());

  const isSelected = useCallback((id: TId) => selected.has(id), [selected]);

  const toggle = useCallback((id: TId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allVisibleSelected = useMemo(
    () => visibleIds.length > 0 && visibleIds.every((id) => selected.has(id)),
    [visibleIds, selected],
  );

  const toggleAllVisible = useCallback(
    (checked: boolean) => {
      setSelected((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => (checked ? next.add(id) : next.delete(id)));
        return next;
      });
    },
    [visibleIds],
  );

  const clear = useCallback(() => setSelected(new Set()), []);

  return {
    selectedIds: selected,
    selectedCount: selected.size,
    isSelected,
    toggle,
    allVisibleSelected,
    toggleAllVisible,
    clear,
  };
}
