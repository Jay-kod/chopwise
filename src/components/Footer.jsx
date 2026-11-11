import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useAppConfig } from '../context/ConfigContext';
import { ROUTES } from '../lib/routes';

/**
 * Standard comprehensive footer for ChopWise.
 * Follows AGENTS.md and docs/UI_GUIDELINES.md.
 */
export default function Footer() {
  const { appName, appTagline } = useAppConfig();
  const currentYear = new Date().getFullYear();
  const name = appName || 'ChopWise';

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand info */}
          <div className="space-y-3 sm:col-span-2 md:col-span-1">
            <Link to="/" className="inline-block">
              <Logo />
            </Link>
            <p className="text-xs text-muted leading-relaxed">
              {appTagline}
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-muted px-2.5 py-1 text-[11px] text-muted">
              <span>🇳🇬</span> Tailored for Nigerian households
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-semibold text-fg">Explore {name}</h4>
            <ul className="space-y-1.5 text-muted">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to={ROUTES.customer.dashboard} className="hover:text-primary transition-colors">
                  Meal Recommendations
                </Link>
              </li>
              <li>
                <Link to={ROUTES.customer.profile} className="hover:text-primary transition-colors">
                  Health &amp; Budget Profile
                </Link>
              </li>
              <li>
                <Link to={ROUTES.customer.login} className="hover:text-primary transition-colors">
                  Account Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinical Focus */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-semibold text-fg">Clinical Focus</h4>
            <ul className="space-y-1.5 text-muted">
              <li>Hypertension &amp; Low Sodium</li>
              <li>Diabetes &amp; Glycemic Control</li>
              <li>Peptic Ulcer Soothing Diets</li>
              <li>Portion &amp; Calorie Management</li>
            </ul>
          </div>

          {/* Legal / Medical Disclaimers */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-semibold text-fg">Clinical Guidance</h4>
            <p className="text-[11px] text-muted leading-relaxed">
              General dietary guidance only, not clinical medical advice. Consult a doctor or registered dietitian for medical diagnosis.
            </p>
            <p className="text-[11px] text-muted leading-relaxed">
              Health information is encrypted and processed strictly in compliance with data privacy standards.
            </p>
          </div>
        </div>

        {/* Sub-footer Bar */}
        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 text-center text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>© {currentYear} {name}. All rights reserved.</p>
          <p className="text-[11px]">
            Nutrition estimates use Gemini, with USDA FoodData Central data where ingredients match.
          </p>
        </div>
      </div>
    </footer>
  );
}
