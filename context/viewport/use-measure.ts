'use client';
import { useState } from 'react';
import { useIsomorphicLayoutEffect } from 'framer-motion';
import { measureContainer } from '@/context/viewport/measure-container';
import { useEventListener } from '@/hooks/event-listener';
import { useTimeoutRef } from '@/hooks/timeout-ref';
import {
  TDimensionsInit,
  TDimensionsReady,
} from '@/types/measure';
import {
  SCREEN_LG,
  SCREEN_MD,
  SCREEN_SM,
  SCREEN_XS,
} from '@/constants/theme';

const RESIZE_COOLDOWN = 400;

export type TContainerState = {
  container?: TDimensionsInit | TDimensionsReady;
};

type TInit = TDimensionsInit & {
  isResizing: boolean;
};

export const INIT_VIEWPORT: TInit = {
  isResizing: false,
  isDimensions: false,
} as const;

type TReady = TDimensionsReady & {
  width: number;
  isResizing: boolean;
  halfWidth: number;
  halfHeight: number;
  isSm: boolean;
  isXs: boolean;
  isMd: boolean;
  isLg: boolean;
  isVertical: boolean;
};
export type TViewport = TInit | TReady;

type TConfig = { isContainer?: boolean };
export const useViewportMeasure = (
  config: TConfig = {}
): TViewport => {
  const [viewport, setViewport] =
    useState<TViewport>(INIT_VIEWPORT);
  const { timeoutRef, endTimeout } = useTimeoutRef();

  const handleSize = (next?: TViewport) => {
    let isResizing = false;
    if (typeof next !== 'undefined') {
      isResizing = next.isResizing;
    }

    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;

    const isDimensions =
      typeof width !== 'undefined' &&
      typeof height !== 'undefined';
    if (isDimensions) {
      const ready = {
        ...(next = INIT_VIEWPORT),
        ...(config.isContainer
          ? {
              container: measureContainer(),
            }
          : {}),
        width,
        height,
        halfWidth: width * 0.5,
        halfHeight: height * 0.5,
        isVertical: width < height && width < 700,
        isXs: width < SCREEN_XS,
        isSm: width < SCREEN_SM,
        isMd: width < SCREEN_MD,
        isLg: width < SCREEN_LG,
        isDimensions,
        isResizing,
      } as const satisfies TReady;
      setViewport(ready);
      return;
    }

    setViewport(next ?? INIT_VIEWPORT);
  };

  const handleResize = () => {
    handleSize({
      ...INIT_VIEWPORT,
      isResizing: true,
    });
    endTimeout();
    timeoutRef.current = setTimeout(() => {
      handleSize(INIT_VIEWPORT);
    }, RESIZE_COOLDOWN);
  };

  useEventListener('resize', handleResize);
  useIsomorphicLayoutEffect(handleSize, []);

  return viewport;
};
