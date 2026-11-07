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
- Build ingredient lines: `"<qty> <unit> <item>"`; for `piece` use `"<qty> <item>"`. Normalise, then hash (`ingredientsHash`).
- Cache hit -> return. Else call Edamam Nutrition Analysis (endpoint constant in `clients/edamam.js`; verify against the docs at https://developer.edamam.com/). Result is per meal (one serving).
- Treat ANY non-2xx, timeout, or low-quality/unparseable response as failure -> fallback to `aiNutritionEstimate` with `source: "ai-estimate"`. Edamam may reject a whole request when one ingredient is unparseable; if so, retry once without the unparseable lines only if the API identifies them, else fallback.
- Respect rate limits: no parallel bursts; map "limited" to a friendly message or fallback.
- Edamam attribution ("Powered by Edamam" linking to developer.edamam.com) must show wherever Edamam data is displayed.
- If the Edamam integration is disabled or not configured, use the AI estimate path directly.

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

## Edamam probe ingredient lines (scripts/edamam-probe.mjs)
200 g egusi (melon seeds) | 50 g ogbono | 100 g ugu leaves | 100 g water leaf | 150 g garri | 200 g yam | 1 cup ofada rice | 1 cup brown beans | 1 ripe plantain | 2 tbsp palm oil | 30 g crayfish | 150 g stockfish | 1 cup ogi (pap) | 1 egg
