import type { FC } from "react";
import { cx } from 'class-variance-authority';
import { TLines_LineProps, Lines_Line } from "@/components/lines/_line";

type TProps = TLines_LineProps;
export const LinesVertical: FC<
  TProps
> = ({
  classValue,
  style,
  ...props
}) => {
  return (
    <Lines_Line
      classValue={cx(
        "h-full w-0",
        classValue
      )}
      sizeClass="border-l"
      style={style}
      {...props}
    />
  );
};
