export const wait = async (waitMs: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, waitMs);
  });
};
