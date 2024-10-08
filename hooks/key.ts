import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";

type THandlers = {
  onKeyDown: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
};
type TConfig = {
  handlers: THandlers;
  isDisabled?: boolean;
};
export const useKey = ({
  handlers,
  isDisabled,
}: TConfig): MutableRefObject<THandlers> => {
  const handlersRef = useRef(handlers);
  const removeListeners = () => {
    window.removeEventListener(
      "keydown",
      handlersRef.current.onKeyDown,
    );
    if (handlersRef.current.onKeyUp) {
      window.removeEventListener(
        "keyup",
        handlersRef.current.onKeyUp,
      );
    }
  };
  useEffect(() => {
    if (Boolean(isDisabled)) {
      removeListeners();
    } else {
      window.addEventListener(
        "keydown",
        handlersRef.current.onKeyDown,
      );
      if (handlersRef.current.onKeyUp) {
        window.addEventListener(
          "keyup",
          handlersRef.current.onKeyUp,
        );
      }
    }
    return removeListeners;
  }, [isDisabled]);
  return handlersRef;
};
