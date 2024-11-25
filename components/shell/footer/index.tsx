'use client';
import { LinesHorizontal } from '@/components/lines/horizontal';
import { ShellFooterTelephone } from '@/components/shell/footer/telephone';
import { ShellFooterEmail } from '@/components/shell/footer/email';
import { cx } from 'class-variance-authority';
import { ShellFooterRow } from '@/components/shell/footer/row';
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
          <div className="flex flex-col items-stretch lg:hidden">
            <ShellFooterLogo />
            <div className="h-9" />
            <LinesHorizontal colorClass="border-gray-3" />
            {/* <div className="h-4.5" /> */}
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
          </div>
        </div>
      </footer>
    </div>
  );
};
