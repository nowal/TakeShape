import { IconsLabor } from '@/components/icons/labor';
import { IconsLaborAndMaterials } from '@/components/icons/labor-and-materials';
import { PreferencesInitialInput } from '@/components/preferences/initial/input';
import { PreferencesInitialText } from '@/components/preferences/initial/text';
import type { FC } from 'react';

const INPUT_PROPS = {
  name: 'preferences-type',
  type: 'radio',
} as const;

type TProps = {
  isLaborAndMaterials: boolean;
  onChange(isLaborAndMaterials: boolean): void;
};
export const PreferencesInitial: FC<TProps> = (
  props
) => {
  return (
    <ul className="flex flex-col items-center gap-4 w-full sm:flex-row">
      <PreferencesInitialInput
        Icon={IconsLaborAndMaterials}
        inputProps={INPUT_PROPS}
        value="labor-and-materials"
        isChecked={props.isLaborAndMaterials}
        onChange={() => props.onChange(true)}
      >
        <PreferencesInitialText
          title="Labor and Materials"
          subtitle="We’ll provide everything."
        />
      </PreferencesInitialInput>
      <div>OR</div>
      <PreferencesInitialInput
        Icon={IconsLabor}
        inputProps={INPUT_PROPS}
        value="labor"
        isChecked={!props.isLaborAndMaterials}
        onChange={() => props.onChange(false)}
      >
        <PreferencesInitialText
          title="Labor Only"
          subtitle="You’ll handle the materials."
        />
      </PreferencesInitialInput>
    </ul>
  );
};
