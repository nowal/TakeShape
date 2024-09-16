import { InputsSelect } from '@/components/inputs/select';
import type { FC } from 'react';

type TProps = {
  color: string;
  finish: string;
  paintQuality: string;
  onChange(event: any): void;
};
export const LaborAndMaterials: FC<TProps> = (props) => {
  return (
    <div className="preferences-row flex flex-col items-center gap-2 mb-6">
      <div className="extra-fields-row flex justify-between w-full">
        <label className="text-left">
          Wall Color
          <input
            type="text"
            name="color"
            placeholder="E.g. white"
            value={props.color || ''}
            onChange={props.onChange}
            className="input-field"
          />
          <div className="tooltip-container">
            <span className="help-link text-sm">
              Undecided?
            </span>
            <span className="tooltiptext">
              Type "Undecided" in the color field and the
              painter you choose can help you with choosing
              a color.
            </span>
          </div>
        </label>
        <InputsSelect
          placeholder="Wall finish"
          name="finish"
          value={props.finish || ''}
          onValueChange={(value) => props.onChange}
          values={[
            'Eggshell',
            'Flat',
            'Satin',
            'Semi-Gloss',
            'High Gloss',
          ]}
        />
        {/* <label className="text-left">
        Wall finish
          <select
            name="finish"
            value={props.finish || ''}
            onChange={props.onChange}
            className="input-field select-field"
          >
            <option value="Eggshell">Eggshell</option>
            <option value="Flat">Flat</option>
            <option value="Satin">Satin</option>
            <option value="Semi-gloss">Semi-Gloss</option>
            <option value="High-gloss">High Gloss</option>
          </select>
        </label> */}
        <span className="tooltip">
          ?
          <span className="tooltiptext">
            We default to eggshell finish because of its
            versatility, but you are welcome to pick
            whatever finish you prefer
          </span>
        </span>
      </div>
      {/* <label className="text-left">
        Paint Quality
        <select
          name="paintQuality"
          value={props.paintQuality || ''}
          onChange={props.onChange}
          className="input-field select-field"
        >
          <option value="Medium">Medium Quality</option>
          <option value="Budget">Budget Quality</option>
          <option value="High">High Quality</option>
        </select>
      </label> */}
      <InputsSelect
        placeholder="Paint Quality"
        name="paintQuality"
        value={props.paintQuality || ''}
        onValueChange={(value) => props.onChange}
        values={[
          'Medium Quality',
          'Budget Quality',
          'High Quality',
        ]}
      />
    </div>
  );
};
