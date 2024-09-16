import { TCommonIconProps } from "@/components/icon";
import { CommonIcon16vb24 } from "@/components/icon/16vb24";
import type { FC } from "react";

export const CHEVRON_LEFT =
  "M16 5v2h-2V5zm-4 4V7h2v2zm-2 2V9h2v2zm0 2H8v-2h2zm2 2v-2h-2v2zm0 0h2v2h-2zm4 4v-2h-2v2z";
export const IconsChevronsLeft: FC<
  TCommonIconProps
> = (props) => {
  return (
    <CommonIcon16vb24
      d={CHEVRON_LEFT}
      {...props}
    />
  );
};
