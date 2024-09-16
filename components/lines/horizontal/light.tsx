import type { FC } from "react";
import clsx from "clsx";
import { Lines_Line } from "@/components/lines/_line";
import { TLinesOptions } from "@/components/lines/types";

type TProps = TLinesOptions;
export const LinesHorizontalLight: FC<
  TProps
> = ({ classValue, ...props }) => {
  return (
    <Lines_Line
      classValue={clsx(
        "w-full h-0",
        classValue
      )}
      sizeClass="border-t"
      colorClass="border-gray-8"
      {...props}
    />
  );
};
