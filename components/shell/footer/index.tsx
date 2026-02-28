'use client';
import { cx } from 'class-variance-authority';
import { ShellFooterLogo } from '@/components/shell/footer/logo';

export const ShellFooter = () => {
  return (
    <div className="flex flex-col items-stretch">
      <footer
        style={{
          marginTop: '-0.9375rem',
        }}
        className="relative max-w-shell w-full mx-auto px-4 pb-10 sm:px-9"
      >
        <div
          className={cx(
            'flex flex-col items-stretch gap-12 w-full bg-white-1 px-9 pb-[29px] pt-[54px] rounded-footer',
            'lg:flex-row lg:items-end lg:gap-0'
          )}
        >
          {/* <div className="flex flex-col items-stretch lg:hidden">
            <ShellFooterLogo />
            <div className="h-9" />
            <LinesHorizontal colorClass="border-gray-3" />
            <div className="h-4.5" />
          </div>
          <ShellFooterRow
            footerRightMenuLinks={
              [] // if no links the left menu links will spread out
              // FOOTER_RIGHT_MENU_LINKS
            }
          />
          <div className="flex flex-col items-stretch lg:hidden">
            <div className="h-18 sm:h-9" />
            <LinesHorizontal colorClass="border-gray-3" />
            <div className="h-9 sm:h-4.5" />
            <div className="flex flex-col items-center gap-8 sm:gap-4 sm:flex-row">
              <ShellFooterEmail />
              <ShellFooterTelephone />
            </div>
          </div> */}
          <div className="grid w-full grid-cols-2 gap-x-4 gap-y-3 typography-footer-poppins text-black-1 lg:grid-cols-4 lg:items-center">
            <div className="flex flex-col items-center gap-3 lg:flex-row lg:justify-start lg:gap-0">
              <div className="flex items-center justify-center lg:justify-start">
                <ShellFooterLogo />
              </div>
              <span className="text-center lg:hidden">
                Copyright 2026 TakeShape
              </span>
            </div>
            <a href="tel:+18652429705" className="justify-self-center self-center lg:order-3">
              (865) 242-9705
            </a>
            <span className="hidden justify-self-center lg:block lg:justify-self-end lg:order-4">
              Copyright 2026 TakeShape
            </span>
            <a href="mailto:admin@takeshapehome.com" className="justify-self-center self-center lg:order-2">
              admin@takeshapehome.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
