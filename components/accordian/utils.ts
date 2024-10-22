import {
  TAccordianItem,
  TComponentsAccordianListPropsItem,
} from '@/components/accordian/types';
import { isString } from '@/utils/validation/is/string';

export const resolveAccordianItems = (
  item: TComponentsAccordianListPropsItem
): TAccordianItem => {
  if (isString(item))
    return {
      title: item,
    };
  if ('question' in item)
    return {
      title: item.question,
      text: item.answer,
    };
  return item;
};
