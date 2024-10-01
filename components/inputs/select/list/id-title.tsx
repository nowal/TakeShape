import { SelectItem } from '@/components/inputs/select/item';
import { LinesHorizontalLight } from '@/components/lines/horizontal/light';
import { TSelectIdItems } from '@/types';
import { Fragment, type FC } from 'react';

export type TInputsSelectListIdTitleProps = {
  values?: TSelectIdItems;
};
export const InputsSelectListIdTitle: FC<
  TInputsSelectListIdTitleProps
> = ({ values }) => {
  return (
    <>
      {values?.map(({ id, ...rest }, index) => {
        const display =
          'title' in rest ? rest.title : rest.name;
        return (
          <Fragment key={id}>
            {index !== 0 && <LinesHorizontalLight />}
            <SelectItem value={id}>{display}</SelectItem>
          </Fragment>
        );
      })}
    </>
  );
};
