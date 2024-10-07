'use client';
import type { FC } from 'react';
import { ComponentsPanel } from '@/components/panel';
import { TPropsWithChildren } from '@/types/dom/main';
import { ComponentsCongratsContent } from '@/components/congrats/content';
import { ButtonsCvaAnchor } from '@/components/cva/anchor';

type TProps = TPropsWithChildren;
export const ComponentsCongratsPanel: FC<TProps> = ({
  children,
}) => {
  return (
    <ComponentsPanel classValue="text-center">
      <ComponentsCongratsContent
        emoji="🎉"
        title="Congratulations on accepting with:"
        long="Contractor will reach out within two days to
          schedule your job. If you have any questions,
          please contact us or you call your contractor
          directly."
        footer={
          <ButtonsCvaAnchor
            title="Contact Support, Call (615) 809-6429"
            href="tel:+16158096429"
            center
          >
            <span className="text-xs text-gray-7 font-semibold">
              Contact Support
            </span>
          </ButtonsCvaAnchor>
        }
      >
        {children}
      </ComponentsCongratsContent>
    </ComponentsPanel>
  );
};
