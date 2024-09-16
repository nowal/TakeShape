import type { FC } from "react";

export const DefaultPreferencesEnd: FC = () => {
  return (
    <div>
        {/* <label className="flex items-center gap-2 mb-4 mt-2">
          <input
            type="checkbox"
            name="moveFurniture"
            checked={moveFurniture}
            onChange={(e) =>
              setMoveFurniture(e.target.checked)
            }
            className="form-checkbox"
          />
          Will the painters need to move any furniture?
        </label> */}
        {/* <label className="text-left">
          Special Requests:
          <textarea
            name="specialRequests"
            placeholder="E.g. Don't paint ceilings in bedrooms, don't remove nails in the wall"
            value={specialRequests}
            onChange={(e) =>
              setSpecialRequests(e.target.value)
            }
            rows={3}
            className="input-field"
          />
        </label> */}
    </div>
  );
};