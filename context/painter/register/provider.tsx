'use client';
import { usePainterRegisterState } from '@/context/painter/register/state';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
} from 'react';

type TPainterRegisterContext = ReturnType<
  typeof usePainterRegisterState
>;
export const PAINTER_REGISTER =
  createContext<TPainterRegisterContext>(
    {} as TPainterRegisterContext
  );

export const usePainterRegister =
  (): TPainterRegisterContext =>
    useContext(PAINTER_REGISTER);

export const PainterRegisterProvider: FC<
  PropsWithChildren
> = ({ children }) => {
  const landing = usePainterRegisterState();
  return (
    <PAINTER_REGISTER.Provider value={landing}>
      {children}
    </PAINTER_REGISTER.Provider>
  );
};
