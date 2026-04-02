export function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

export function normalize(value: number, minValue: number, maxValue: number) {
  if (maxValue === minValue) return 50;
  const score = ((value - minValue) / (maxValue - minValue)) * 100;
  return clamp(score);
}

export function inverseNormalize(
  value: number,
  maxBad: number,
  minGood: number
) {
  if (maxBad === minGood) return 50;
  const score = ((maxBad - value) / (maxBad - minGood)) * 100;
  return clamp(score);
}

export function weightedAverage(entries: [number, number][]) {
  const totalWeight = entries.reduce((acc, [, weight]) => acc + weight, 0);
  if (!totalWeight) return 0;

  const total = entries.reduce(
    (acc, [value, weight]) => acc + value * weight,
    0
  );

  return total / totalWeight;
}

export function idealRangeScore(
  value: number,
  idealMin: number,
  idealMax: number,
  hardMax: number
) {
  if (value >= idealMin && value <= idealMax) return 100;
  if (value < idealMin) return clamp((value / idealMin) * 100);
  if (value > idealMax) {
    const overflow = value - idealMax;
    const maxOverflow = hardMax - idealMax;
    if (maxOverflow <= 0) return 50;
    return clamp(100 - (overflow / maxOverflow) * 100);
  }
  return 50;
}

export function stdDev(values: number[]) {
  if (values.length <= 1) return 0;
  const avg = average(values);
  const variance =
    values.reduce((acc, value) => acc + Math.pow(value - avg, 2), 0) /
    values.length;

  return Math.sqrt(variance);
}