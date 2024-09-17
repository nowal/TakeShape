import SignInButton from "@/components/buttons/sign-in-button";
import { ButtonsCvaButton, TButtonsCvaButtonProps } from "@/components/cva/button";
import { ALREADY_HAVE_AN_ACCOUNT_TEXT } from "@/components/sign-up/constants";
import type { FC } from "react";

type TProps = Partial<TButtonsCvaButtonProps>
export const SignUpLogin: FC<TProps> = (props) => {
  return (
    <div>
      <div className="p-8">
        <h2 className="text-center text-2xl font-bold mb-6">
          {ALREADY_HAVE_AN_ACCOUNT_TEXT}
        </h2>
        <SignInButton />
        <ButtonsCvaButton
        title="Go back"
          {...props}
        >
          Go Back
        </ButtonsCvaButton>
      </div>
    </div>
  );
};