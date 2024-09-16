import { NotificationsHighlight } from "@/components/notifications/highlight";
import type { FC } from "react";

export const PreferencesNotificationsInformation: FC = () => {
  return (
    <div>
        <NotificationsHighlight>
            None of your information will be shared with
            painters until you accept a quote. Rest assured,
            your privacy is our priority.
          </NotificationsHighlight>
    </div>
  );
};