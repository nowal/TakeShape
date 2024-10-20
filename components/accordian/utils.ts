import {
  TAccordianItem,
  TComponentsAccordianListPropsItem,
} from '@/components/accordian/types';

export const resolveAccordianItems = (
  item: TComponentsAccordianListPropsItem
): TAccordianItem => {
  if ('question' in item)
    return {
      title: item.question,
      text: item.answer,
    };
  return item;
};
