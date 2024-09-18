import { SelectItem } from '@/components/inputs/select/item';
import { LinesHorizontalLight } from '@/components/lines/horizontal/light';
import { TSelectIdTitleItem } from '@/types/types';
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
