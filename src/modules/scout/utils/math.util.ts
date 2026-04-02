export function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

export function round(value: number, decimals = 2) {
  return Number(value.toFixed(decimals));
}