import { TCommonIconFC } from '@/components/icon';
import { CommonIcon12 } from '@/components/icon/12';

export const IconsTick: TCommonIconFC = (props) => {
  return (
    <CommonIcon12
      d="M2.25 5.67857L4.97727 8.25L9.75 3.75"
      fill="none"
      pathProps={{
        stroke: 'var(--pink)',
        strokeWidth: '2.25',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }}
      {...props}
    />
  );
};
