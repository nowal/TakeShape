import type { FC } from "react";
import { motion } from "framer-motion";
import { TLinesOptions } from "@/components/lines/types";
import { cx } from 'class-variance-authority';

export type TLines_LineProps =TLinesOptions;
export const Lines_Line: FC<TLines_LineProps> = ({
  positionClass,
  colorClass,
  classValue,
  // opacityClass,
  style,
  sizeClass,
  ...props
}) => {
  return (
    <motion.hr
      className={cx(
        "grow pointer-events-none",
        positionClass ?? "relative",
        sizeClass ?? "border",
        colorClass ?? "border-black",
        // opacityClass ??"opacity-50",
        classValue
      )}
      style={{ ...style }}
      {...props}
    />
  );
};
