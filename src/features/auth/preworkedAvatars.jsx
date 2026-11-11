/**
 * Preworked & Designed Avatars for ChopWise Administrators & Team.
 * Clean, lightweight static vector assets served from /avatars/.
 */

export const PREWORKED_AVATARS = [
  {
    id: 'chef-babatunde',
    name: 'Chef Babatunde',
    title: 'Executive Head Chef',
    category: 'Culinary Master',
    badge: 'Head of Kitchen',
    src: '/avatars/chef-babatunde.svg',
  },
  {
    id: 'chef-ngozi',
    name: 'Chef Ngozi',
    title: 'Culinary Taste Director',
    category: 'Traditional Soups',
    badge: 'Soup Specialist',
    src: '/avatars/chef-ngozi.svg',
  },
  {
    id: 'dr-amina',
    name: 'Dr. Amina',
    title: 'Clinical Dietitian',
    category: 'Dietary Science',
    badge: 'Nutritional Health',
    src: '/avatars/dr-amina.svg',
  },
  {
    id: 'commander-danjuma',
    name: 'Cmdr. Danjuma',
    title: 'Security & Operations',
    category: 'Platform Security',
    badge: 'Admin Lead',
    src: '/avatars/commander-danjuma.svg',
  },
  {
    id: 'maestro-obinna',
    name: 'Maestro Obinna',
    title: 'Naija Food Connoisseur',
    category: 'Cultural Heritage',
    badge: 'Authentic Nigerian',
    src: '/avatars/maestro-obinna.svg',
  },
  {
    id: 'specialist-zainab',
    name: 'Specialist Zainab',
    title: 'Portion & Calorie Lead',
    category: 'Portion Control',
    badge: 'Nutrition Metrics',
    src: '/avatars/specialist-zainab.svg',
  },
  {
    id: 'scout-emeka',
    name: 'Scout Emeka',
    title: 'Market Price Auditor',
    category: 'Market Pricing',
    badge: 'Price Table Lead',
    src: '/avatars/scout-emeka.svg',
  },
];

/**
 * Render an avatar given an ID, custom URL, or fallback.
 */
export function AvatarDisplay({ avatarId, className = 'size-8', fallback = 'A' }) {
  if (!avatarId) {
    return <span className="font-semibold text-xs">{fallback}</span>;
  }

  const found = PREWORKED_AVATARS.find((a) => a.id === avatarId);
  const src = found ? found.src : avatarId;

  if (typeof src === 'string' && (src.startsWith('/') || src.startsWith('data:image/') || src.startsWith('http'))) {
    return (
      <img
        src={src}
        alt="Profile Avatar"
        className={`object-cover size-full rounded-full ${className}`}
      />
    );
  }

  return <span className="font-semibold text-xs">{fallback}</span>;
}
