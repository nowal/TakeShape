'use client';
import {QuoteButton} from '@/components/buttons/quote/quoteButton';
import { ButtonsCvaLink } from '@/components/cva/link';
import { LinesHorizontal } from '@/components/lines/horizontal';
import { FOOTER_RIGHT_MENU_LINKS } from '@/components/shell/footer/constants';
import { ShellFooterList } from '@/components/shell/footer/list';
import { ShellFooterTelephone } from '@/components/shell/footer/telephone';
import { ShellLogo } from '@/components/shell/logo';
import { cx } from 'class-variance-authority';
import { usePathname } from 'next/navigation';

export const ShellFooter = () => {
  const pathname = usePathname();
  const isHome = pathname === '/';
  return (
    <div className='flex flex-col items-stretch'>
      {!isHome && <div className="h-8" />}
      <footer
        style={{
          marginTop: '-0.9375rem',
        }}
        className="relative max-w-shell w-full mx-auto px-6 pb-10 z-10 lg:px-9"
      >
        <div
          className={cx(
            'flex flex-col items-stretch gap-6 w-full bg-white-1 px-9 pb-[29px] pt-[54px] rounded-footer',
            'lg:flex-row lg:items-end lg:gap-0'
          )}
        >
          <div className="flex flex-col items-stretch lg:hidden">
            <ShellLogo />
            <div className="h-9" />
            <LinesHorizontal colorClass="border-gray-3" />
            <div className="h-4.5" />
          </div>

          <div className="flex flex-row w-full w-10/12 xl:w-7/12">
            <div className="hidden flex-col gap-[69px] w-6/12 lg:flex">
              <div className="flex flex-col gap-[27px]">
                <ShellLogo />
                <div className="flex flex-col items-start typography-footer gap-[14px]">
                  <div className="whitespace-pre">
                    123 Main Street New York,{'\n'}
                    NY 10001
                  </div>
                  <ShellFooterTelephone />
                </div>
              </div>
              <div className="typography-footer-poppins">
                ©2024 Takeshape®
              </div>
            </div>

            <ul className="flex flex-col gap-12 justify-between w-full pl-0 md:gap-0 md:flex-row xl:pl-8 2xl:pl-0">
              {(
                [
                  {
                    title: 'For Clients',
                    items: [
                      { title: 'How to Hire' },
                      { title: 'Talent Marketplace' },
                      { title: 'Project Catalog' },
                    ],
                  },
                  {
                    title: 'For Talent',
                    items: [
                      { title: 'How to Find Work' },
                      { title: 'Help & Support' },
                    ],
                  },
                ] as const
              ).map((listListProps) => (
                <li
                  key={listListProps.title}
                  className="px-0 w-1/2"
                >
                  <ShellFooterList {...listListProps} />
                </li>
              ))}
            </ul>
          </div>

          <ul className="hidden flex-col justify-between w-2/12 typography-footer-poppins lg:flex xl:flex-row xl:w-5/12">
            {FOOTER_RIGHT_MENU_LINKS.map((item) => (
              <li key={item.title} className="self-end">
                <ButtonsCvaLink {...item} />
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-stretch lg:hidden">
            <div className="h-18 sm:h-9" />
            <LinesHorizontal colorClass="border-gray-3" />
            <div className="h-9 sm:h-4.5" />
            <div className="flex flex-col items-center gap-8 sm:gap-4 sm:flex-row">
              <QuoteButton />
              <ShellFooterTelephone />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
{
  /* <Link
          href="/aboutUs"
          className="text-sm mt-2 hover:underline"
        >
          About Us
        </Link>
        <a
          href="mailto:takeshapehome@gmail.com?subject=Contact%20DwellDone"
          className="text-center text-sm"
        >
          Contact Us
        </a> */
}
