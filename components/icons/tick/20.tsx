import { TCommonIconFC } from '@/components/icon';
import { IconsTick } from '@/components/icons/tick';

export const IconsTick20: TCommonIconFC = (props) => {
  return (
    <IconsTick
      size={16}
      pathProps={{
        stroke: 'currentColor',
        strokeWidth: '2.25',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }}
      {...props}
    />
  );
};
