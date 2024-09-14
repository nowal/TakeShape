import type { FC } from 'react';

type TProps = {
  isSelected: boolean;
  isCeilingsPainted: boolean;
  ceilingColor: string;
  ceilingFinish: string;
  onChange(event: any): void;
};
export const CeilingFieldsLaborAndMaterials: FC<TProps> = ({
  isSelected,
  ...props
}) => {
  return (
    <>
      <label className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          name="ceilings"
          checked={props.isCeilingsPainted}
          onChange={props.onChange}
        />
        Do you want your ceilings painted?
      </label>
      {isSelected && (
        <div className="extra-fields-row flex justify-between w-full">
          <label className="text-left">
            Ceiling Color
            <input
              type="text"
              name="ceilingColor"
              placeholder="Ceiling Color"
              value={props.ceilingColor || 'White'}
              onChange={props.onChange}
              className="input-field"
            />
          </label>
          <label className="text-left">
            Ceiling Finish
            <select
              name="ceilingFinish"
              value={props.ceilingFinish || ''}
              onChange={props.onChange}
              className="input-field select-field"
            >
              <option value="Flat">Flat</option>
              <option value="Eggshell">Eggshell</option>
              <option value="Satin">Satin</option>
              <option value="Semi-gloss">Semi-Gloss</option>
              <option value="High-gloss">High Gloss</option>
            </select>
          </label>
          <span className="tooltip">
            ?
            <span className="tooltiptext">
              This color and finish are the most standard
              for ceilings, but you are welcome to pick your
              own.
            </span>
          </span>
        </div>
      )}
    </>
  );
};
