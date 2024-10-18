import { FOOTER_BACKGROUND_COLOR } from '@/components/shell/footer/constants';
import { ShellLogo } from '@/components/shell/logo';
import { FC } from 'react';

export const ShellFooterLogo: FC = () => {
  return (
    <ShellLogo backgroundColor={FOOTER_BACKGROUND_COLOR} />
  );
};
