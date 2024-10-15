import { IconsLoading } from '@/components/icons/loading';
import { IconsTick20 } from '@/components/icons/tick/20';

export const SEE_VIDEO_TITLE = 'See Video Example';
export const SUCCESS_ICON = {
  icon: { Leading: IconsTick20 },
  intent: 'ghost-success',
} as const;
export const LOADING_ICON = {
  icon: { Leading: IconsLoading },
};
