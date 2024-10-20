import { IconsChevronsDown } from '@/components/icons/chevrons/down';
import { IconsChevronsUp } from '@/components/icons/chevrons/up';
import { InViewReplacersFadeUp } from '@/components/in-view/replacers/fade-up';
import { LinesHorizontal } from '@/components/lines/horizontal';
import { cx } from 'class-variance-authority';
import { FC, useState } from 'react';
import { TComponentsAccordianListProps } from '@/components/accordian/types';
import { resolveAccordianItems } from '@/components/accordian/utils';

export const ComponentsAccordianList: FC<
  TComponentsAccordianListProps
> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState<
    number | null
  >(null);
  const paddingClass = 'p-6 lg:px-16 lg:py-9';
  const paddingClassAnswer =
    'px-6 pt-0 pb-6 lg:px-16 lg:pb-9';
  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="relative w-full text-left py-20 lg:mt-0">
      <ul className="flex flex-col shadow-08 bg-white rounded-2xl">
        {items.map((item, index) => {
          const { title, text } =
            resolveAccordianItems(item);
          const isFirst = index === 0;
          return (
            <li key={index} className="">
              {!isFirst && (
                <LinesHorizontal
                  colorClass="border-gray-9"
                  classValue="mx-6 lg:mx-16"
                />
              )}
              <button
                onClick={() => handleToggle(index)}
                className={cx(
                  'flex flex-row items-center justify-between w-full typography-landing-text',
                  'gap-6 lg:gap-2',
                  paddingClass
                )}
              >
                <InViewReplacersFadeUp
                  fadeUpProps={{
                    delay: index * 0.1 + 0.1,
                  }}
                >
                  <div className="text-left">{title}</div>
                </InViewReplacersFadeUp>

                <div>
                  {activeIndex === index ? (
                    <IconsChevronsUp />
                  ) : (
                    <IconsChevronsDown />
                  )}
                </div>
              </button>
              <div
                className={cx(
                  'typography-landing-text',
                  paddingClassAnswer,
                  activeIndex === index ? 'flex' : 'hidden'
                )}
              >
                {text}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
