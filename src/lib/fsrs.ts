import { fsrs, FSRS, generatorParameters } from 'ts-fsrs';

const params = generatorParameters({
  request_retention: 0.9,
  maximum_interval: 36500,
  w: [
    0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046,
    1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898,
  ],
});

export const scheduler: FSRS = fsrs(params);

/**
 * Calculates retrievability R(t) based on the FSRS forgetting curve.
 * R(t) = exp(ln(0.9) * (t / S))
 */
export function calculateRetrievability(stability: number, elapsedDays: number): number {
  if (stability <= 0 || elapsedDays <= 0) return 0;
  const R = Math.exp(Math.log(0.9) * (elapsedDays / stability)) * 100;
  return Math.min(100, Math.max(0, R));
}
