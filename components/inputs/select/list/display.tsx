import { TSelectIdItems } from '@/types';
import { isNumber } from '@/utils/validation/is/number';

export const selectListDisplay = (
  value: TSelectIdItems[number]
) => {
  if ('title' in value) return value.title;
  if ('count' in value) {
    return (
      <div className="flex flex-row items-center gap-1">
        <div>{value.name}</div>
        {isNumber(value.count) && value.count > 0 && (
          <div className="typography-pink-xs">
            ({value.count})
          </div>
        )}
      </div>
    );
  }

  if ('hex' in value) {
    return (
      <div className="flex flex-row items-center justify-between gap-1.5">
        <div className="shrink truncate max-w-44">
          {value.name}
        </div>
        <div
          className="size-6 rounded-full border border-gray"
          style={{ backgroundColor: `#${value.hex}` }}
        />
      </div>
    );
  }

  return value.name;
};
