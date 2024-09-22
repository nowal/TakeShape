import { IconsChevronsDown } from '@/components/icons/chevrons/down';
import { IconsChevronsUp } from '@/components/icons/chevrons/up';
import { FAQ_COPY_ROWS } from '@/components/landing/faq/constants';
import { LinesHorizontal } from '@/components/lines/horizontal';
import { cx } from 'class-variance-authority';
import { FC, useState } from 'react';

export const LandingFaqRight: FC = () => {
  const [activeIndex, setActiveIndex] = useState<
    number | null
  >(null);
  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  return (
    <div className="relative w-full p-12 text-left">
      <ul className="flex flex-col shadow-08 bg-white rounded-2xl">
        {FAQ_COPY_ROWS.map((faq, index) => {
          const isFirst = index === 0;
          return (
            <li key={index} className="">
              {!isFirst && (
                <LinesHorizontal
                  colorClass="border-gray-9"
                  classValue="mx-16"
                />
              )}
              <button
                onClick={() => handleToggle(index)}
                className={cx(
                  'flex flex-row items-center justify-between w-full typography-landing-text',
                  'px-16 py-9',
                  'gap-6'
                )}
              >
                <div className='text-left'>{faq.question}</div>
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
                  'px-16 pb-9',
                  activeIndex === index ? 'flex' : 'hidden'
                )}
              >
                {faq.answer}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
