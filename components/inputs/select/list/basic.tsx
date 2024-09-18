import { TSelectValues } from '@/components/inputs/select/types';
import { LinesHorizontalLight } from '@/components/lines/horizontal/light';
import { SelectItem } from '@radix-ui/react-select';
import { Fragment, type FC } from 'react';

export type TInputsSelectListBasicProps = { values?: TSelectValues };
export const InputsSelectListBasic: FC<TInputsSelectListBasicProps> = ({ values }) => {
  return (
    <>
      {values?.map((value, index) => {
        return (
          <Fragment key={value}>
            {index !== 0 && <LinesHorizontalLight />}
            <SelectItem value={value}>{value}</SelectItem>
          </Fragment>
        );
      })}
    </>
  );
};
