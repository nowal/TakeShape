'use client';
import { ButtonsCvaLink } from '@/components/cva/link';
import { FOOTER_RIGHT_MENU_LINKS } from '@/components/shell/footer/constants';
import { ShellFooterList } from '@/components/shell/footer/list';
import { ShellLogo } from '@/components/shell/logo';
import { title } from 'process';

export const ShellFooter = () => {
  return (
    <footer className="max-w-shell w-full px-9 py-10 mx-auto">
      <div className="flex flex-row items-end w-full bg-white-1 px-9 pb-[29px] pt-[54px] rounded-[15px]">
        <div className="flex flex-row w-7/12">
          <div className="flex flex-col gap-[69px] w-6/12">
            <div className="flex flex-col gap-[27px]">
              <ShellLogo />
              <div className="flex flex-col items-start typography-footer gap-[14px]">
                <div className="whitespace-pre">
                  123 Main Street New York,{'\n'}
                  NY 10001
                </div>
                <a href="tel:+16158096429">
                  (615) 809-6429
                </a>
              </div>
            </div>
            <div className="typography-footer-poppins">
              ©2024 Takeshape®
            </div>
          </div>

          <div className="flex flex-row justify-between w-6/12">
            <ShellFooterList
              title="For Clients"
              items={[
                { title: 'How to Hire' },
                { title: 'Talent Marketplace' },
                { title: 'Project Catalog' },
              ]}
            />
            <ShellFooterList
              title="For Talent"
              items={[
                { title: 'How to Find Work' },
                { title: 'Help & Support' },
              ]}
            />
          </div>
        </div>

        <ul className="flex flex-row justify-between w-5/12 typography-footer-poppins">
          {FOOTER_RIGHT_MENU_LINKS.map((item) => (
            <li key={item.title}>
              <ButtonsCvaLink {...item} />
            </li>
          ))}
        </ul>
      </div>
    </footer>
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
