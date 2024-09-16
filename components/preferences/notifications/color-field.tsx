import type { FC } from 'react';

export const PreferencesNotificationsColorField: FC = () => {
  return (
    <div className="tooltip-container">
      <span className="help-link text-sm">Undecided?</span>
      <span className="tooltiptext">
        Type "Undecided" in the color field and the painter
        you choose can help you with choosing a color.
      </span>
    </div>
  );
};
