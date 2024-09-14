import type { FC } from 'react';

type TProps = {
  isSelected: boolean;
  isTrimAndDoorsPainted: boolean;
  trimColor: string;
  trimFinish: string;
  onChange(event: any): void;
};
export const ShowFieldsLaborAndMaterials: FC<TProps> = ({
  isSelected,
  ...props
}) => {
  return (
    <>
      <label className="flex items-center gap-2 mt-2 mb-2">
        <input
          type="checkbox"
          name="trim"
          checked={props.isTrimAndDoorsPainted}
          onChange={props.onChange}
        />
        Do you want your trim and doors painted?
      </label>
      {isSelected && (
        <div className="extra-fields-row flex justify-between w-full">
          <label className="text-left">
            Trim Color
            <input
              type="text"
              name="trimColor"
              placeholder="Trim Color"
              value={props.trimColor || 'White'}
              onChange={props.onChange}
              className="input-field"
            />
          </label>
          <label className="text-left">
            Trim Finish
            <select
              name="trimFinish"
              value={props.trimFinish || ''}
              onChange={props.onChange}
              className="input-field select-field"
            >
              <option value="Semi-gloss">Semi-Gloss</option>
              <option value="Flat">Flat</option>
              <option value="Eggshell">Eggshell</option>
              <option value="Satin">Satin</option>
              <option value="High-gloss">High Gloss</option>
            </select>
          </label>
          <span className="tooltip">
            ?
            <span className="tooltiptext">
              This color and finish are the most standard
              for trim, but you are welcome to pick your
              own.
            </span>
          </span>
        </div>
      )}
    </>
  );
};
