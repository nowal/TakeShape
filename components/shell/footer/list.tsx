import {
  ButtonsCvaLink,
  TButtonsCvaLinkProps,
} from '@/components/cva/link';
import type { FC } from 'react';

type TProps = {
  title: string;
  items: TButtonsCvaLinkProps[];
};
export const ShellFooterList: FC<TProps> = ({
  title,
  items,
}) => {
  return (
    <div className="flex flex-col gap-8">
      <h4 className="typography-footer-title">{title}</h4>
      <ul className="flex flex-col gap-5 typography-footer-open-sans">
        {items.map((item) => (
          <li key={item.title}>
            <ButtonsCvaLink {...item} />
          </li>
        ))}
      </ul>
    </div>
  );
};
