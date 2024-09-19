import { Dispatch } from 'react';

export type TAuthConfig = {
  isUserSignedIn: boolean;
  dispatchUserSignedIn: Dispatch<boolean>;
};
