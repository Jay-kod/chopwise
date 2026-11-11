import { CURATED_BREAKFAST } from './curated/breakfast.js';
import { CURATED_LUNCH } from './curated/lunch.js';
import { CURATED_DINNER } from './curated/dinner.js';

/**
 * Curated list of classic, approved Nigerian meals with complete,
 * authentic recipe definitions, market price breakdowns, and nutrient estimates.
 */
export const CURATED_NIGERIAN_MEALS = [
  ...CURATED_BREAKFAST,
  ...CURATED_LUNCH,
  ...CURATED_DINNER,
];
