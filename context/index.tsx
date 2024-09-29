import { AccountSettingsProvider } from '@/context/account-settings/provider';
import { AuthProvider } from '@/context/auth/provider';
import { DashboardPainterProvider } from '@/context/dashboard/painter/provider';
import { DashboardProvider } from '@/context/dashboard/provider';
import { PreferencesProvider } from '@/context/preferences/provider';
import { QuoteProvider } from '@/context/quote/provider';
import { ViewportProvider } from '@/context/viewport';
import { TChildrenProps } from '@/types/dom';
import { arrToNest } from '@/utils/transform/arrToNest';
import { FC, PropsWithChildren, useMemo } from 'react';

type TProps = TChildrenProps;
export const ContextProviders: FC<TProps> = ({
  children: _children,
}) => {
  const children = useMemo(() => {
    return arrToNest<PropsWithChildren>(
      [
        PreferencesProvider,
        AccountSettingsProvider,
        AuthProvider,
        QuoteProvider,
        DashboardProvider,
        DashboardPainterProvider,
        ViewportProvider,
      ],
      _children,
      {}
    );
  }, []);

  return <>{children}</>;
};
