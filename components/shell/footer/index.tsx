'use client';
import { ShellFooterList } from '@/components/shell/footer/list';
import { ShellLogo } from '@/components/shell/logo';

export const ShellFooter = () => {
  return (
    <footer className="max-w-shell w-full px-9 pb-10 mx-auto">
      <div className="flex flex-row items-end bg-white-1 px-9 pb-[29px] pt-[54px] rounded-[15px]">
        <div className="flex flex-row">
          <div className="flex flex-col gap-[69px]">
            <div className="flex flex-col gap-[27px]">
              <ShellLogo />
              <div className="flex flex-col items-start typography-footer gap-[14px]">
                <div>
                  123 Main Street New York, NY 10001
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
          <div className="flex flex-row">
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
        <ul className="flex flex-row typography-footer-poppins">
          <li>Cookie Settings</li>
          <li>Terms of Service</li>
          <li>Privacy Policy</li>
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
