import { TDivProps } from "@/types/dom";
import type { FC } from "react";

export const LinesHorizontal1: FC<
  TDivProps
> = (props) => {
  return (
    <div
      className="absolute top-1/2  left-1/2 opacity-20 h-px w-screen bg-current -translate-1/2 pointer-events-none"
      {...props}
    />
  );
};
