import { LinesHorizontalLight } from '@/components/lines/horizontal/light';
import { TSelectIdTitleItem } from '@/types/types';
import { SelectItem } from '@radix-ui/react-select';
import { Fragment, type FC } from 'react';

export type TInputsSelectListIdTitleProps = { values?: TSelectIdTitleItem[] };
export const InputsSelectListIdTitle: FC<TInputsSelectListIdTitleProps> = ({
  values,
}) => {
  return (
    <>
      {values?.map(({ id, title }, index) => {
        return (
          <Fragment key={id}>
            {index !== 0 && <LinesHorizontalLight />}
            <SelectItem value={id}>{title}</SelectItem>
          </Fragment>
        );
      })}
    </>
  );
};
