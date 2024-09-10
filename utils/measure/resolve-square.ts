export const resolveSquare = (size: number) => {
  return {
    width: size,
    height: size,
  } as const;
};
