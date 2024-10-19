import { AccountSettingsProvider } from '@/context/account-settings/provider';
import { AgentDashboardProvider } from '@/context/agent/dashboard/provider';
import { AgentRegisterProvider } from '@/context/agent/register/provider';
import { AppProvider } from '@/context/app/provider';
import { AuthProvider } from '@/context/auth/provider';
import { DashboardPainterProvider } from '@/context/dashboard/painter/provider';
import { DashboardProvider } from '@/context/dashboard/provider';
import { PainterRegisterProvider } from '@/context/painter/register/provider';
import { PreferencesProvider } from '@/context/preferences/provider';
import { QuoteProvider } from '@/context/quote/provider';
import { ViewportProvider } from '@/context/viewport';
import { TChildrenProps } from '@/types/dom';
import { arrToNest } from '@/utils/transform/arr-to-nest';
import { FC, PropsWithChildren, useMemo } from 'react';
import { MapsProvider } from '@/components/maps/provider';


type TProps = TChildrenProps;
export const ContextProviders: FC<TProps> = ({
  children: _children,
}) => {
  const children = useMemo(() => {
    return arrToNest<PropsWithChildren>(
      [
        AgentDashboardProvider,
        AgentRegisterProvider,
        PainterRegisterProvider,
        DashboardPainterProvider,
        ViewportProvider,
        QuoteProvider,
        DashboardProvider,
        PreferencesProvider,
        AuthProvider,
        AccountSettingsProvider,
        AppProvider,
        MapsProvider,

      ],
      _children,
      {}
    );
  }, []);

  return <>{children}</>;
};
