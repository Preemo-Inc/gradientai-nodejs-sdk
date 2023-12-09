export const isUndefined = (t: unknown): t is undefined =>
  typeof t === "undefined";

export const isString = (t: unknown): t is string => typeof t === "string";

export const isLengthyString = (t: unknown): t is string =>
  isString(t) && t.length > 0;

export const expectNever = (t: never): never => {
  throw new Error(`unexpected call to expectNever with ${t}`);
};
