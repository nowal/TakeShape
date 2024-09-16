import { IconsLabor } from '@/components/icons/labor';
import { IconsLaborAndMaterials } from '@/components/icons/labor-and-materials';
import { DefaultPreferencesOptionsInitialInput } from '@/components/preferences/options/initial/input';
import { DefaultPreferencesOptionsInitialText } from '@/components/preferences/options/initial/text';
import type { FC } from 'react';

const INPUT_PROPS = {
  name: 'preferences-type',
  type: 'radio',
} as const;

type TProps = {
  isLaborAndMaterials: boolean;
  onChange(isLaborAndMaterials: boolean): void;
};
export const DefaultPreferencesOptionsInitial: FC<
  TProps
> = (props) => {
  return (
    <ul className="flex flex-row items-center gap-4 w-full">
      <DefaultPreferencesOptionsInitialInput
        Icon={IconsLabor}
        inputProps={INPUT_PROPS}
        value="labor"
        isChecked={!props.isLaborAndMaterials}
        onChange={() => props.onChange(false)}
      >
        <DefaultPreferencesOptionsInitialText
          title="Labor Only"
          subtitle="You’ll handle the materials."
        />
      </DefaultPreferencesOptionsInitialInput>
      <div>OR</div>
      <DefaultPreferencesOptionsInitialInput
        Icon={IconsLaborAndMaterials}
        inputProps={INPUT_PROPS}
        value="labor-and-materials"
        isChecked={props.isLaborAndMaterials}
        onChange={() => props.onChange(true)}
      >
        <DefaultPreferencesOptionsInitialText
          title="Labor and Material"
          subtitle="We’ll provide everything."
        />
      </DefaultPreferencesOptionsInitialInput>
    </ul>
  );
};
