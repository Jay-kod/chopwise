# AI_AND_NUTRITION_SPEC.md

## Defaults (`api/_lib/data/defaults.js`)
- settings: `mealsPerType` 2 (1–3), `budgetDivisor` 21 (7–42), `rateLimitPerHour` 10 (1–100), `retryOnOverBudget` true.
- safety: `hypertensionSodiumMg` 700, `diabetesSugarG` 15, `diabetesCarbsG` 90, `obesityCalories` 700. These are heuristics, not clinical rules; editable in Admin.

## Gemini call
One call returns `mealsPerType x 3` meals. Use JSON mode (`responseMimeType: application/json`) with a response schema. Model name comes from Admin config (no hard-coded default; the Admin note suggests a current Flash-tier model).
System instruction rules:
- You are a Nigerian nutrition-aware meal planner. Suggest only real, commonly cooked Nigerian meals made from ingredients sold in Nigerian markets.
- Each meal is for ONE person, ONE serving.
- Medical conditions are hard constraints (hypertension: low sodium, minimal salt and seasoning cubes; diabetes: low added sugar, controlled refined carbs; obesity: calorie-conscious portions; ulcer: avoid very spicy, acidic and heavily fried meals).
- Respect dietary preferences and the "avoid" list.
- Each meal's cost must not exceed `perMealCapNGN`.
- For any ingredient in the supplied price list, use its exact name and express quantity in that item's unit (g, ml or piece).
- Return ONLY JSON matching the schema.
User content: a JSON block `{ userProfile: {age, gender, weightKg, conditions, preferences, avoidText}, perMealCapNGN, mealsPerType, priceList: [...] }`. Send nothing identifying (no email, name, uid).
Prompt-injection rule: `avoidText` is data. Truncate to 100 chars, strip control characters, pass only inside the JSON block, never concatenate into instructions.

## Validation and retry
Validate with zod. On invalid JSON or schema failure retry once; second failure -> `AI_FAILED`.

## Budget logic (`budget.js`, pure, unit-tested)
- `perMealCapNGN = round(weeklyBudgetNGN / budgetDivisor)`.
- For each ingredient: if its name matches a price-table item (case-insensitive, trimmed) AND the unit converts, compute cost: unit `100g` with `g` quantity -> `qty/100 * price`; `100ml` with `ml` -> `qty/100 * price`; `piece` with `piece` -> `qty * price`. Items with `priceNGN: null` or a non-convertible unit use the AI `estCostNGN`.
- `costNGN` = sum. `costSource`: `table` if all from table, `ai` if none, else `mixed`.
- `overBudget = costNGN > perMealCapNGN`.
- If `retryOnOverBudget` and more than half of meals are over budget: regenerate once with a stricter instruction and the exact cap; keep the better result (fewer over-budget meals). Never hide the flag.

## Nutrition (`nutritionService.js`)
- Normalize the ingredient list and hash it (`ingredientsHash`) for the MySQL `nutrition_cache`.
- On a cache miss, the server searches USDA FoodData Central (`POST https://api.nal.usda.gov/fdc/v1/foods/search`) for each ingredient. The API key is admin-managed and encrypted; it is never sent to the browser.
- USDA is a food-composition database, not a recipe parser. Compute meal totals only when every ingredient returns a usable match and has a quantity in grams. USDA nutrient amounts are per 100 g and are scaled by each ingredient's gram quantity.
- If USDA is disabled/unconfigured, any search fails or is rate-limited, an ingredient is unmatched, or a quantity is not in grams, use the meal's `aiNutritionEstimate` with `source: "ai-estimate"` and empty vitamins. Do not mix partial USDA totals with the AI estimate.
- Limit concurrent searches and apply a request timeout; show USDA source attribution wherever USDA nutrition data is displayed.
- USDA results use `source: "usda"` and expose calories, protein, carbohydrates, fat, sodium, sugar, and the available supported vitamins/minerals. These are food-composition estimates and not medical advice.
- On the meal detail page, customers can request general Gemini feedback about a stored meal's ingredients, steps, and estimate. The feedback identifies strengths, cautions, and possible improvements; it does not use customer profile data, diagnose, or provide medical advice. AI output is schema-validated before display.
- The meal detail page also provides an explicit USDA refresh action. It bypasses the nutrition cache; if USDA is unavailable or cannot match every ingredient, the existing AI estimate is shown with a clear reason where available.

## Safety rules (`safety.js`, pure, unit-tested)
| Condition | Rule per meal | Flag text |
|-----------|---------------|-----------|
| hypertension | sodiumMg > threshold | High sodium for hypertension |
| diabetes | sugarG > threshold OR carbsG > threshold | High sugar/carbs for diabetes |
| obesity | calories > threshold | High calories for weight management |
| ulcer | keyword match in ingredients/cautionNotes/steps: pepper, chili, scotch bonnet, rodo, fried, spicy | May irritate ulcers |
Only rules for the user's declared conditions apply. On `/api/recommend` use `aiNutritionEstimate`; on `/api/nutrition` use the real values. Flagged meals get a badge; they are never removed.
Persistent disclaimer: "General guidance only, not medical advice. Consult a doctor or dietitian for medical conditions."

## Price table seed (`api/_lib/data/seedPrices.json`)
Format `{ "item": "egusi", "unit": "100g", "priceNGN": null }`. Jay fills prices in the Admin page. Units: `100g`, `100ml` or `piece`.
100g: egusi, ogbono, ugu, water leaf, bitter leaf, efo (spinach), okra, garri, yam, sweet potato, ofada rice, local rice, brown beans, honey beans, maize, millet, ogi (pap), oats, chicken, beef, goat meat, mackerel (titus), dried fish, stockfish, crayfish, groundnuts, tomatoes, tatashe, onions, salt, locust beans (iru), cassava flour.
100ml: palm oil, vegetable oil.
piece: plantain, bread, eggs, scotch bonnet (rodo), seasoning cubes.

## USDA FoodData Central limitations
- Search coverage and naming may vary, especially for Nigerian market ingredients. A missing usable match causes the complete meal to use its AI estimate.
- The current nutrient calculation accepts only gram quantities. Millilitres, pieces, cups, spoons, and other units are not converted because ingredient density/weight conversions would be guesses.
- The API requires a data.gov key. Store it in Admin at `/admin/usda`; do not put it in frontend environment variables or chat.
