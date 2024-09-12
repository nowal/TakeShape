import type { FC } from "react";

export const LinesHorizontalShadow: FC =
  () => {
    return (
      <div className="absolute -inset-4 bg-black dark:bg-white filter-blur-50 rounded-lg opacity-20 pointer-events-none" />
    );
  };
