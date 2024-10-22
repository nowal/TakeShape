import { LinesHorizontal } from '@/components/lines/horizontal';
import { cx } from 'class-variance-authority';
import { FC, useState } from 'react';
import { TComponentsAccordianListProps } from '@/components/accordian/types';
import { resolveAccordianItems } from '@/components/accordian/utils';
import { isDefined } from '@/utils/validation/is/defined';
import { ComponentsAccordianItemExpandable } from '@/components/accordian/item/expandable';
import { ComponentsAccordianItem } from '@/components/accordian/item';
import { ComponentsAccordianItemTitle } from '@/components/accordian/item/title';

export const ComponentsAccordianList: FC<
  TComponentsAccordianListProps
> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState<
    number | null
  >(null);
  const paddingClass = 'p-6 lg:px-16 lg:py-9';
  const paddingClassText =
    'px-6 pt-0 pb-6 lg:px-16 lg:pb-9';
  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="relative w-full text-left py-20 lg:mt-0">
      <ul className="flex flex-col shadow-08 bg-white rounded-2xl">
        {items.map((item, index) => {
          const accordianItem = resolveAccordianItems(item);
          const isExpandable = isDefined(
            accordianItem.text
          );
          const isFirst = index === 0;
          const sharedProps = {
            className: cx(
              'flex flex-row items-center justify-between w-full typography-landing-text',
              'gap-6 lg:gap-2',
              paddingClass
            ),
            ...accordianItem,
          };

          const renderTitle = (
            <ComponentsAccordianItemTitle
              title={accordianItem.title}
              index={index}
            />
          );
          return (
            <li key={index} className="">
              {!isFirst && (
                <LinesHorizontal
                  colorClass="border-gray-9"
                  classValue="mx-6 lg:mx-16"
                />
              )}
              {isExpandable ? (
                <ComponentsAccordianItemExpandable
                  onClick={() => handleToggle(index)}
                  isExpanded={index === activeIndex}
                  paddingClassText={paddingClassText}
                  {...sharedProps}
                >
                  {renderTitle}
                </ComponentsAccordianItemExpandable>
              ) : (
                <ComponentsAccordianItem {...sharedProps}>
                  {renderTitle}
                </ComponentsAccordianItem>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
