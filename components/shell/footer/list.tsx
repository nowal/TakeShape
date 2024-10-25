import {
  CvaLink,
  TCvaLinkProps,
} from '@/components/cva/link';
import type { FC } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Import usePathname and useRouter

type TProps = {
  title: string;
  items: readonly (TCvaLinkProps & { href: string })[];
};

export const ShellFooterList: FC<TProps> = ({
  title,
  items,
}) => {
  const pathname = usePathname(); 
  const router = useRouter();

  const handleClick = (href: string) => {
    // Prevent full page reload if already on the link's page
    if (pathname === href) {
      return;
    }
    router.push(href); 
  };

  return (
    <div className="flex flex-col gap-8">
      <h4 className="typography-footer-title">{title}</h4>
      <ul className="flex flex-col gap-5 typography-footer-open-sans">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`}>
            <button onClick={() => handleClick(item.href)}> 
              <CvaLink {...item} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};