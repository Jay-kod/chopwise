import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { APP_NAME, APP_TAGLINE } from '../lib/constants';
import { useAuth } from '../features/auth/useAuth';

const STEPS = [
  {
    icon: '📋',
    title: 'Tell us about you',
    desc: 'Share your health conditions, dietary preferences and weekly food budget in naira.',
  },
  {
    icon: '🍲',
    title: 'Get personalised meals',
    desc: 'AI picks real Nigerian meals that fit your health needs and stay within your budget.',
  },
  {
    icon: '📊',
    title: 'See the nutrition',
    desc: 'View verified nutrition data for every meal, with safety flags for your conditions.',
  },
];

export default function Landing() {
  const { user, profileComplete } = useAuth();

  const ctaDestination = !user ? '/register' : profileComplete ? '/dashboard' : '/onboarding';
  const ctaLabel = !user
    ? "Get started — it's free"
    : profileComplete
    ? 'Go to Dashboard'
    : 'Complete your profile';

  return (
    <Layout>
      {/* Hero */}
      <section className="py-12 text-center sm:py-20">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          {APP_NAME}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted">
          {APP_TAGLINE}
        </p>
        <div className="mt-8">
          <Link to={ctaDestination}>
            <Button className="px-8 text-base">{ctaLabel}</Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="pb-16">
        <h2 className="mb-8 text-center text-2xl font-bold">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 rounded-xl border border-line bg-surface p-6 text-center"
            >
              <span className="text-3xl" aria-hidden="true">
                {step.icon}
              </span>
              <h3 className="text-lg font-semibold text-fg">
                {`${i + 1}. ${step.title}`}
              </h3>
              <p className="text-sm text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
