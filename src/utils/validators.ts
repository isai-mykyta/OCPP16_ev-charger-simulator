export const isPositiveIntegerString = (value: string): boolean => {
  return /^[1-9]\d*$/.test(value);
};

export const isBoolString = (value: string): boolean => {
  return ["true", "false"].includes(value);
};
