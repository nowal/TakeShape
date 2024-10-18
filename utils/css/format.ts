export const resolveHash = (id: string) =>
  `#${id}` as const;

export const resolveUrlId = (id: string) =>
  `url(${resolveHash(id)})` as const;

export const capitalize = (
  word: string | null,
) =>
  word
    ? `${word[0]?.toUpperCase()}${word
        .toLowerCase()
        .slice(1)}`
    : '';


