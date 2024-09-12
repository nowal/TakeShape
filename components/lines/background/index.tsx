import { LinesHorizontal } from "@/components/lines/horizontal";
import { TLinesOptions } from "@/components/lines/types";
import type { FC } from "react";

type TProps = {
  Root?: FC<TLinesOptions>;
} & TLinesOptions;
export const LinesBackground: FC<
  TProps
> = ({ Root = LinesHorizontal, ...props }) => {
  return (
    <Root
      opacityClass="opacity-20"
      {...props}
    />
  );
};
