import type { FC } from 'react';
import { cx } from 'class-variance-authority';
import { TButtonsCvaLinkProps } from '@/components/cva/link';
import { ButtonsCvaLink } from '@/components/cva/link';
import { ShellFooterList } from '@/components/shell/footer/list';
import { ShellFooterTelephone } from '@/components/shell/footer/telephone';
import { ShellFooterEmail } from '@/components/shell/footer/email';
import { ShellFooterLogo } from '@/components/shell/footer/logo';

type TProps = {
  footerRightMenuLinks: TButtonsCvaLinkProps[];
};
export const ShellFooterRow: FC<TProps> = ({
  footerRightMenuLinks,
}) => {
  const isNoRightMenuLinks =
    footerRightMenuLinks.length === 0;
  console.log('isNoRightMenuLinks ', isNoRightMenuLinks);
  return (
    <>
      <div
        className={cx(
          'flex flex-row w-full w-10/12',
          isNoRightMenuLinks ? 'xl:w-full' : 'xl:w-7/12'
        )}
      >
        <div className="hidden flex-col gap-[69px] w-6/12 lg:flex">
          <div className="flex flex-col gap-[27px]">
            <ShellFooterLogo />
            <div className="flex flex-col items-start typography-footer gap-[14px]">
              <ShellFooterEmail />
              <ShellFooterTelephone />
              {/*<div className="whitespace-pre">
                    Murfreesboro,{'\n'}
                    TN 37129
                  </div>*/}
            </div>
          </div>
          <div className="typography-footer-poppins">
            ©2024 Takeshape®
          </div>
        </div>

        <ul className="flex flex-col gap-12 justify-between w-full pl-0 md:gap-0 md:flex-row xl:pl-8 2xl:pl-0">
          {[
            {
              title: 'For Homeowners',
              items: [
                {
                  title: 'Hiring Tips',
                  href: '/hiringTips',
                }, // Add href to each item
                { title: 'About Us', href: '/aboutUs' },
              ],
            },
            {
              title: 'For Painters',
              items: [
                {
                  title: 'Partnership Requirements',
                  href: '/painterRequirements',
                },
                {
                  title: 'Request to Join',
                  href: '/painterRegister',
                },
              ],
            },
          ].map((listListProps) => (
            <li
              key={listListProps.title}
              className="px-0 w-1/2"
            >
              <ShellFooterList {...listListProps} />
            </li>
          ))}
        </ul>
      </div>

      {!isNoRightMenuLinks && (
        <ul className="hidden flex-col justify-between w-2/12 typography-footer-poppins lg:flex xl:flex-row xl:w-5/12">
          {footerRightMenuLinks.map((item) => (
            <li key={item.title} className="self-end">
              <ButtonsCvaLink {...item} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
