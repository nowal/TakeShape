export const isPainterPaying = (
  painterData: Record<string, unknown> | null | undefined
) => {
  if (!painterData) return false;

  const explicitPaid = painterData.paid;
  if (typeof explicitPaid === 'boolean') {
    return explicitPaid;
  }

  const explicitPaying = painterData.paying;
  if (typeof explicitPaying === 'boolean') {
    return explicitPaying;
  }

  const subscriptionStatus = String(
    painterData.subscriptionStatus || ''
  )
    .trim()
    .toLowerCase();

  return (
    subscriptionStatus === 'active' ||
    subscriptionStatus === 'trialing'
  );
};
