#!/usr/bin/env node
/**
 * scripts/edamam-probe.mjs
 * De-risks Edamam Nutrition Analysis API against realistic Nigerian ingredients and full meals.
 * Run with: node --env-file=.env.local scripts/edamam-probe.mjs
 *
 * Never prints or leaks API keys.
 */

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;

if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
  console.error('================================================================');
  console.error('EDAMAM PROBE: EDAMAM_APP_ID or EDAMAM_APP_KEY is missing in environment.');
  console.error('Please create .env.local with your keys:');
  console.error('  EDAMAM_APP_ID=<your-app-id>');
  console.error('  EDAMAM_APP_KEY=<your-app-key>');
  console.error('Run: node --env-file=.env.local scripts/edamam-probe.mjs');
  console.error('================================================================');
  process.exit(1);
}

const PROBE_INGREDIENTS = [
  '200 g egusi (melon seeds)',
  '50 g ogbono',
  '100 g ugu leaves',
  '100 g water leaf',
  '150 g garri',
  '200 g yam',
  '1 cup ofada rice',
  '1 cup brown beans',
  '1 ripe plantain',
  '2 tbsp palm oil',
  '30 g crayfish',
  '150 g stockfish',
  '1 cup ogi (pap)',
  '1 egg',
];

const FULL_MEALS = [
  {
    name: 'Egusi Soup with Pounded Yam',
    ingr: [
      '200 g melon seeds',
      '2 tbsp palm oil',
      '100 g spinach',
      '30 g dried crayfish',
      '150 g beef',
      '1 tsp salt',
      '200 g yam',
    ],
  },
  {
    name: 'Nigerian Jollof Rice',
    ingr: [
      '2 cups long grain rice',
      '3 fresh tomatoes',
      '1 red bell pepper',
      '1 onion',
      '2 tbsp vegetable oil',
      '1 tsp salt',
      '1 tsp curry powder',
      '1 tsp dried thyme',
    ],
  },
  {
    name: 'Beans and Fried Plantain',
    ingr: [
      '1 cup brown beans',
      '1 ripe plantain',
      '1 tbsp palm oil',
      '1 small onion',
      '1 tsp salt',
    ],
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callEdamam(title, ingrList) {
  const url = `https://api.edamam.com/api/nutrition-details?app_id=${encodeURIComponent(
    EDAMAM_APP_ID
  )}&app_key=${encodeURIComponent(EDAMAM_APP_KEY)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        title,
        ingr: ingrList,
        yield: 1,
      }),
    });

    const status = res.status;
    let data = null;
    let errorText = '';

    try {
      data = await res.json();
    } catch {
      errorText = await res.text().catch(() => '');
    }

    if (!res.ok) {
      errorText = data?.error || data?.message || errorText || `HTTP ${status}`;
      return { status, parsed: false, calories: 0, nutrients: null, errorText };
    }

    const calories = Math.round(data?.calories || 0);
    const parsed = calories > 0 || (Array.isArray(data?.ingredients) && data.ingredients.length > 0);

    return {
      status,
      parsed,
      calories,
      nutrients: data?.totalNutrients || {},
      errorText: '',
    };
  } catch (err) {
    return {
      status: 'ERR',
      parsed: false,
      calories: 0,
      nutrients: null,
      errorText: err?.message || 'Network error',
    };
  }
}

async function runProbe() {
  console.log('\n=== CHOPWISE EDAMAM NUTRITION PROBE ===\n');
  console.log('--- 1. Single Ingredient Probe (1.5s delay between requests) ---');
  console.log('| Ingredient Line | HTTP | Parsed? | Calories | Error / Notes |');
  console.log('|-----------------|------|---------|----------|---------------|');

  for (const line of PROBE_INGREDIENTS) {
    const res = await callEdamam(`Probe - ${line}`, [line]);
    const parsedStr = res.parsed ? 'YES' : 'NO';
    const calStr = res.parsed ? `${res.calories} kcal` : '-';
    const errStr = res.errorText ? res.errorText.slice(0, 40) : (res.parsed ? 'OK' : 'Low quality / unparsed');

    console.log(
      `| ${line.padEnd(25)} | ${String(res.status).padEnd(4)} | ${parsedStr.padEnd(7)} | ${calStr.padEnd(8)} | ${errStr} |`
    );

    await sleep(1500);
  }

  console.log('\n--- 2. Full Nigerian Meals Probe ---');
  console.log('| Meal Name | HTTP | Parsed? | Calories | Protein | Carbs | Fat | Error / Notes |');
  console.log('|-----------|------|---------|----------|---------|-------|-----|---------------|');

  for (const meal of FULL_MEALS) {
    const res = await callEdamam(meal.name, meal.ingr);
    const parsedStr = res.parsed ? 'YES' : 'NO';
    const calStr = res.parsed ? `${res.calories} kcal` : '-';
    const proStr = res.nutrients?.PROCNT ? `${Math.round(res.nutrients.PROCNT.quantity)}g` : '-';
    const carbStr = res.nutrients?.CHOCDF ? `${Math.round(res.nutrients.CHOCDF.quantity)}g` : '-';
    const fatStr = res.nutrients?.FAT ? `${Math.round(res.nutrients.FAT.quantity)}g` : '-';
    const errStr = res.errorText ? res.errorText.slice(0, 30) : (res.parsed ? 'OK' : 'Unparsed');

    console.log(
      `| ${meal.name.padEnd(30)} | ${String(res.status).padEnd(4)} | ${parsedStr.padEnd(7)} | ${calStr.padEnd(8)} | ${proStr.padEnd(7)} | ${carbStr.padEnd(5)} | ${fatStr.padEnd(3)} | ${errStr} |`
    );

    await sleep(1500);
  }

  console.log('\nProbe completed.\n');
}

runProbe();
