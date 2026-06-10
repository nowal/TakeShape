export const getCommunicationDashboardPath = (providerId: string) =>
  `/communicationDashboard?provider=${encodeURIComponent(providerId)}`;

export const getProviderSignupPath = (providerId: string) =>
  `/signup?provider=${encodeURIComponent(providerId)}`;

export const getProviderLoginPath = (providerId?: string | null) =>
  providerId
    ? `/login?provider=${encodeURIComponent(providerId)}`
    : '/login';

export const getCommunicationDashboardUrl = ({
  origin,
  providerId,
}: {
  origin: string;
  providerId: string;
}) => new URL(getCommunicationDashboardPath(providerId), origin).toString();
