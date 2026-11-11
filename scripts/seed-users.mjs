import { query, ensureDatabaseAndTables } from '../api/_lib/mysql.js';
import { hashPassword } from '../api/_lib/authTokens.js';
import { computeProfileHash } from '../api/_lib/services/prompt.js';

const TEST_PASSWORD = 'password1';
const passwordHash = hashPassword(TEST_PASSWORD);

const TEST_USER = {
  id: 'test-user-001',
  email: 'chop1@test.com',
  password_hash: passwordHash,
  consent_at: new Date('2026-11-08T12:00:00Z'),
  profile_complete: 1,
  profile: {
    age: 28,
    gender: 'female',
    weightKg: 65,
    conditions: ['hypertension'],
    preferences: ['no-pork'],
    avoidText: '',
    weeklyBudgetNGN: 21000,
    updatedAt: new Date().toISOString(),
  },
};

const TEST_ADMIN = {
  id: 'test-admin-001',
  email: 'adminchop@test.com',
  password_hash: passwordHash,
  consent_at: new Date('2026-11-08T12:00:00Z'),
  profile_complete: 1,
  profile: {
    age: 35,
    gender: 'male',
    weightKg: 75,
    conditions: [],
    preferences: ['high-protein'],
    avoidText: '',
    weeklyBudgetNGN: 35000,
    updatedAt: new Date().toISOString(),
  },
};

const SAMPLE_MEALS_USER = [
  {
    id: 'oatmeal-boiled-egg-banana-a1b2',
    name: 'Oatmeal with Boiled Egg & Banana',
    mealType: 'breakfast',
    description: 'Heart-healthy Nigerian breakfast with whole oats, boiled egg, and fresh banana.',
    prepTimeMinutes: 15,
    ingredients: [
      { item: 'rolled oats', quantity: 1, unit: 'cup', estCostNGN: 250 },
      { item: 'egg', quantity: 1, unit: 'piece', estCostNGN: 150 },
      { item: 'banana', quantity: 1, unit: 'piece', estCostNGN: 100 },
    ],
    steps: [
      'Boil water in a small pot and stir in the rolled oats.',
      'Simmer on low heat for 5 minutes until creamy.',
      'Boil the egg in a separate pot for 8-10 minutes, peel and slice.',
      'Serve warm oatmeal topped with fresh banana slices and boiled egg.',
    ],
    suitableFor: ['hypertension', 'general'],
    cautionNotes: 'Naturally low in sodium, ideal for managing blood pressure.',
    aiNutritionEstimate: { calories: 380, proteinG: 18, carbsG: 55, fatG: 9, sodiumMg: 120, sugarG: 14 },
    costNGN: 500,
    costSource: 'table',
    overBudget: false,
    safetyFlags: [],
  },
  {
    id: 'brown-rice-steamed-fish-efo-c3d4',
    name: 'Brown Rice with Steamed Fish & Efo Riro',
    mealType: 'lunch',
    description: 'Steamed fresh croaker fish served with nutrient-dense spinach stew and whole brown rice.',
    prepTimeMinutes: 35,
    ingredients: [
      { item: 'brown rice', quantity: 1, unit: 'cup', estCostNGN: 350 },
      { item: 'fresh fish (croaker)', quantity: 200, unit: 'g', estCostNGN: 700 },
      { item: 'spinach (efo)', quantity: 150, unit: 'g', estCostNGN: 150 },
      { item: 'red bell pepper (tatashe)', quantity: 1, unit: 'piece', estCostNGN: 100 },
    ],
    steps: [
      'Wash and cook brown rice with water until tender.',
      'Season fresh croaker fish with natural herbs and steam gently for 15 minutes.',
      'Chop spinach and flash-cook in a light bell pepper sauce without bouillon cubes.',
      'Plate the steamed fish with warm brown rice and vegetable stew.',
    ],
    suitableFor: ['hypertension', 'general'],
    cautionNotes: 'Low sodium; prepared without artificial seasoning cubes.',
    aiNutritionEstimate: { calories: 520, proteinG: 38, carbsG: 62, fatG: 11, sodiumMg: 180, sugarG: 5 },
    costNGN: 1300,
    costSource: 'table',
    overBudget: false,
    safetyFlags: [],
  },
  {
    id: 'moi-moi-steamed-cabbage-e5f6',
    name: 'Steamed Moi Moi with Sautéed Cabbage',
    mealType: 'dinner',
    description: 'Traditional Nigerian steamed bean pudding seasoned with onions and peppers, served with tender cabbage.',
    prepTimeMinutes: 45,
    ingredients: [
      { item: 'black eyed beans', quantity: 1, unit: 'cup', estCostNGN: 250 },
      { item: 'red pepper', quantity: 1, unit: 'piece', estCostNGN: 80 },
      { item: 'onion', quantity: 1, unit: 'piece', estCostNGN: 70 },
      { item: 'cabbage', quantity: 150, unit: 'g', estCostNGN: 120 },
    ],
    steps: [
      'Soak and peel black eyed beans, blend with pepper and onion into a smooth puree.',
      'Wrap puree in leaves or steam cups and steam for 35 minutes until set.',
      'Lightly stir-fry shredded cabbage with olive oil for 3 minutes.',
      'Serve the fluffy warm moi moi alongside crunchy shredded cabbage.',
    ],
    suitableFor: ['hypertension', 'diabetes', 'general'],
    cautionNotes: 'High in fiber and potassium, supports vascular health.',
    aiNutritionEstimate: { calories: 340, proteinG: 22, carbsG: 46, fatG: 6, sodiumMg: 140, sugarG: 4 },
    costNGN: 520,
    costSource: 'table',
    overBudget: false,
    safetyFlags: [],
  },
];

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Test accounts cannot be seeded in production.');
  }

  console.log('Seeding test user and admin accounts into MySQL...');
  await ensureDatabaseAndTables();

  // 1. Seed regular user
  await query(
    `INSERT INTO users (id, email, password_hash, created_at, consent_at, profile_complete, profile, updated_at)
     VALUES (?, ?, ?, NOW(), ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       password_hash = VALUES(password_hash),
       profile_complete = VALUES(profile_complete),
       profile = VALUES(profile),
       consent_at = VALUES(consent_at),
       updated_at = NOW()`,
    [
      TEST_USER.id,
      TEST_USER.email,
      TEST_USER.password_hash,
      TEST_USER.consent_at,
      TEST_USER.profile_complete,
      JSON.stringify(TEST_USER.profile),
    ]
  );
  console.log(`✓ Seeded User: ${TEST_USER.email} (password: ${TEST_PASSWORD})`);

  // 2. Seed admin user
  await query(
    `INSERT INTO users (id, email, password_hash, created_at, consent_at, profile_complete, profile, updated_at)
     VALUES (?, ?, ?, NOW(), ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       password_hash = VALUES(password_hash),
       profile_complete = VALUES(profile_complete),
       profile = VALUES(profile),
       consent_at = VALUES(consent_at),
       updated_at = NOW()`,
    [
      TEST_ADMIN.id,
      TEST_ADMIN.email,
      TEST_ADMIN.password_hash,
      TEST_ADMIN.consent_at,
      TEST_ADMIN.profile_complete,
      JSON.stringify(TEST_ADMIN.profile),
    ]
  );
  console.log(`✓ Seeded Admin: ${TEST_ADMIN.email} (password: ${TEST_PASSWORD})`);

  await query(
    `INSERT INTO admin_roles (user_id, granted_by)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE granted_by = VALUES(granted_by)`,
    [TEST_ADMIN.id, TEST_ADMIN.id]
  );
  console.log(`✓ Granted administrator access to ${TEST_ADMIN.email}`);

  // 3. Seed latest recommendations cache for user
  const userProfileHash = computeProfileHash(TEST_USER.profile);
  await query(
    `INSERT INTO latest_recs (user_id, meals, profile_hash, per_meal_cap_ngn, generated_at)
     VALUES (?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       meals = VALUES(meals),
       profile_hash = VALUES(profile_hash),
       per_meal_cap_ngn = VALUES(per_meal_cap_ngn),
       generated_at = NOW()`,
    [TEST_USER.id, JSON.stringify(SAMPLE_MEALS_USER), userProfileHash, 1500]
  );
  console.log(`✓ Seeded 3 sample Nigerian meals in latest_recs for ${TEST_USER.email}`);

  // 4. Seed a saved meal for user
  const savedMeal = SAMPLE_MEALS_USER[1]; // Brown Rice with Steamed Fish
  await query(
    `INSERT INTO saved_meals (id, user_id, meal_id, meal, saved_at)
     VALUES (?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE meal = VALUES(meal), saved_at = NOW()`,
    [`${TEST_USER.id}_${savedMeal.id}`, TEST_USER.id, savedMeal.id, JSON.stringify(savedMeal)]
  );
  console.log(`✓ Seeded saved recipe "${savedMeal.name}" for ${TEST_USER.email}`);

  console.log('\nSeeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
