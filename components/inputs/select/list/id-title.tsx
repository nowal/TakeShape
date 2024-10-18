import { SelectItem } from '@/components/inputs/select/item';
import { selectListDisplay } from '@/components/inputs/select/list/display';
import { LinesHorizontalLight } from '@/components/lines/horizontal/light';
import { TSelectIdItems } from '@/types';
import { Fragment, type FC } from 'react';

export type TDisplayResolver = (
  value: TSelectIdItems[number]
) => string;
export type TInputsSelectValuesDisplayResolverProps = {
  resolveDisplay?: TDisplayResolver;
};
export type TInputsSelectValuesProps =
  TInputsSelectValuesDisplayResolverProps & {
    values?: TSelectIdItems;
  };
export const InputsSelectValues: FC<
  TInputsSelectValuesProps
> = ({ values, resolveDisplay = selectListDisplay }) => {
  return (
    <>
      {values?.map((value, index) => {
        const display = resolveDisplay(value);
        const id = 'id' in value ? value.id : value.hex;
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
