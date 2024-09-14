import { DefaultPreferencesInitialOptionsInput } from '@/app/defaultPreferences/_options/_initial-options/input';
import { IconsLabor } from '@/components/icons/labor';
import { IconsLaborAndMaterials } from '@/components/icons/labor-and-materials';
import type { FC } from 'react';

const INPUT_PROPS = {
  name: 'preferences-type',
  type: 'radio',
} as const;

type TProps = {
  isLaborAndMaterials: boolean;
  onChange(isLaborAndMaterials: boolean): void;
};
export const DefaultPreferencesInitialOptions: FC<
  TProps
> = (props) => {
  return (
    <ul className="flex flex-row items-stretch w-full gap-4">
      <DefaultPreferencesInitialOptionsInput
        Icon={IconsLabor}
        inputProps={INPUT_PROPS}
        value={'labor'}
        isChecked={!props.isLaborAndMaterials}
        onChange={() => props.onChange(false)}
      >
        Labor
      </DefaultPreferencesInitialOptionsInput>
      <div>OR</div>
      <DefaultPreferencesInitialOptionsInput
        Icon={IconsLaborAndMaterials}
        inputProps={INPUT_PROPS}
        value={'labor-and-materials'}
        isChecked={props.isLaborAndMaterials}
        onChange={() => props.onChange(true)}
      >
        Labor and Material
      </DefaultPreferencesInitialOptionsInput>
    </ul>
  );
};
