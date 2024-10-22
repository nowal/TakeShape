export type TAccordianFaqItem = {
  question: string;
  answer: string;
};
export type TAccordianItem = {
  title: string;
  text?: string;
};
export type TComponentsAccordianListPropsItems =
  | readonly TAccordianFaqItem[]
  | readonly TAccordianItem[]
  | readonly string[];
export type TComponentsAccordianListPropsItem =
  TComponentsAccordianListPropsItems[number];
export type TComponentsAccordianListProps = {
  items: TComponentsAccordianListPropsItems;
};
