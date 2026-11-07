export const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80';

export const CONDITIONS = [
  {
    icon: '🫀',
    name: 'Hypertension',
    desc: 'Low-sodium meals minimizing artificial bouillon cubes; favors scent leaf, garlic, and potassium-rich local greens.',
    badge: 'Sodium Conscious',
  },
  {
    icon: '🩺',
    name: 'Diabetes',
    desc: 'Controlled glycemic impact with complex carbs: unripe plantain, beans, and nutrient-packed soups that prevent glucose spikes.',
    badge: 'Low Glycemic',
  },
  {
    icon: '🥣',
    name: 'Peptic Ulcer',
    desc: 'Gentle, soothing preparations avoiding hot chili peppers, heavy frying, and citrus acidity for optimal digestive comfort.',
    badge: 'Non-Irritating',
  },
  {
    icon: '⚖️',
    name: 'Weight Management',
    desc: 'High-fiber, high-protein portions crafted from Nigerian soups and lean proteins that keep you full without excess calories.',
    badge: 'Calorie Balanced',
  },
];

export const STEPS = [
  {
    step: '01',
    icon: '📋',
    title: 'Share Your Health Profile',
    desc: 'Enter your age, weight, medical conditions, foods to avoid, and your weekly food budget in Naira (₦).',
  },
  {
    step: '02',
    icon: '🍲',
    title: 'AI Crafts Your Nigerian Plan',
    desc: 'ChopWise curates authentic breakfast, lunch, and dinner options with ingredient amounts and cooking steps.',
  },
  {
    step: '03',
    icon: '📊',
    title: 'Cook with Verified Nutrition',
    desc: 'See verified calories, protein, carbs, fat, and sodium, paired with market-reconciled Naira cost estimates.',
  },
];

export const SAMPLE_MEALS = [
  {
    type: 'Lunch',
    time: '35 mins',
    name: 'Efo Riro with Smoked Mackerel & Unripe Plantain',
    desc: 'Rich spinach stew cooked with locust beans (iru), smoked fish, and boiled green plantain.',
    cost: '₦1,250',
    tags: ['Hypertension Safe', 'Diabetes Friendly'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  },
  {
    type: 'Dinner',
    time: '30 mins',
    name: 'Oat Swallow with Mild Fresh Okro & Chicken',
    desc: 'High-fiber oat swallow served with lightly stewed okro and tender skinless chicken breast.',
    cost: '₦950',
    tags: ['Ulcer Friendly', 'Weight Conscious'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
  },
  {
    type: 'Breakfast',
    time: '45 mins',
    name: 'Steamed Moi Moi with Egg & Garden Salad',
    desc: 'Protein-packed pureed brown beans steamed with boiled egg and garden greens.',
    cost: '₦800',
    tags: ['High Protein', 'Low Carb'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  },
];
