import { forwardRef, useImperativeHandle } from 'react';

import {
  TCircleProps,
  TCircleRef,
  useAddressCircle,
} from '@/hooks/address/circle';

const AddressCircle = forwardRef(
  (props: TCircleProps, ref: TCircleRef) => {
    const circle = useAddressCircle(props);

    useImperativeHandle(ref, () => circle);
    return null;
  }
);

AddressCircle.displayName = 'AddressCircle';

export { AddressCircle };
