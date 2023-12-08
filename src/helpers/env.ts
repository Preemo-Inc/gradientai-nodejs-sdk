import { isLengthyString, isUndefined } from "./typeChecking";

export const getOptionalEnvValue = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  if (!isLengthyString(value)) {
    return;
  }

  return value;
};

export const getRequiredEnvValue = (key: string): string => {
  const value = getOptionalEnvValue(key);
  if (isUndefined(value)) {
    throw new Error(`Missing ${key} env variable`);
  }

  return value;
};
