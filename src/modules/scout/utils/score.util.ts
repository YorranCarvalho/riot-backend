export function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

export function round(value: number, decimals = 2) {
  return Number(value.toFixed(decimals));
}

export function standardDeviation(values: number[]) {
  if (!values.length) return 0;

  const mean = values.reduce((acc, value) => acc + value, 0) / values.length;
  const variance =
    values.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) / values.length;

  return Math.sqrt(variance);
}