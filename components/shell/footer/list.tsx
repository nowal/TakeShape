import { TButtonsCvaLinkProps } from '@/components/cva/link';
import type { FC } from 'react';

type TProps = {title:string,items:TButtonsCvaLinkProps[]}
export const ShellFooterList: FC<TProps> = ({title, items}) => {
  return (
    <div className="flex flex-col gap-8 typography-footer-title">
      <h4>For Clients</h4>
      <ul className="flex flex-col gap-5 typography-footer-open-sans">
        <li>How to Hire</li>
        <li>Talent Marketplace</li>
        <li>Project Catalog</li>
      </ul>
    </div>
  );
};
