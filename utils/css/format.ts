export const resolveHash = (id: string) =>
  `#${id}` as const;

export const resolveUrlId = (id: string) =>
  `url(${resolveHash(id)})` as const;
