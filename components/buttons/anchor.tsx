import { TAnchorProps } from '@/types/dom';
import React, { FC } from 'react';
import { resolveTitle } from './resolve-title';

export const AnchorWithTitle: FC<TAnchorProps> = ({
  children,
  title: _title,
  ...props
}) => {
  const title = resolveTitle({ children, title: _title });
  return (
    <a title={title} {...props}>
      {children ?? title}
    </a>
  );
};
