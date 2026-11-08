import { useAppConfig } from '../context/ConfigContext';
import { LogoMark } from './Logo';

/**
 * Branded animated preloader for ChopWise.
 * Displays animated simmering logo, animated "ChopWise..." dots, and a progress shimmer.
 *
 * @param {object} props
 * @param {boolean} [props.fullScreen=false] - Whether to render as a fixed full-screen overlay.
 * @param {string} [props.message='Preparing your kitchen…'] - Subtitle displayed under the logo.
 * @param {string} [props.className=''] - Additional container classes.
 */
export default function Preloader({
  fullScreen = false,
  message = 'Preparing your kitchen…',
  className = '',
}) {
  const { appName } = useAppConfig();
  const name = appName || 'ChopWise';
  const isChopWise = name.toLowerCase() === 'chopwise';

  const containerClasses = fullScreen
    ? `fixed inset-0 z-50 flex flex-col items-center justify-center bg-page/90 backdrop-blur-sm p-4 ${className}`
    : `flex min-h-[50vh] flex-col items-center justify-center p-6 ${className}`;

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className="flex flex-col items-center space-y-4 text-center">
        {/* Animated Brand Emblem with Simmering Pulse */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-3xl bg-primary-soft/60 animate-ping opacity-75" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft border border-line shadow-sm transition-transform animate-pulse">
            <div className="scale-125">
              <LogoMark />
            </div>
          </div>
        </div>

        {/* Animated App Name and Bouncing Dots ("ChopWise...") */}
        <div className="flex items-center gap-1 text-xl sm:text-2xl font-extrabold tracking-tight text-fg">
          {isChopWise ? (
            <span>
              Chop<span className="text-primary">Wise</span>
            </span>
          ) : (
            <span>{name}</span>
          )}
          <span className="inline-flex text-primary font-black tracking-normal">
            <span className="animate-bounce [animation-delay:0ms]">.</span>
            <span className="animate-bounce [animation-delay:150ms]">.</span>
            <span className="animate-bounce [animation-delay:300ms]">.</span>
          </span>
        </div>

        {/* Progress Shimmer Bar */}
        <div className="w-48 h-1.5 overflow-hidden rounded-full bg-surface-muted border border-line">
          <div className="h-full w-2/3 rounded-full bg-primary animate-pulse" />
        </div>

        {/* Informative Subtitle */}
        {message && (
          <p className="text-xs text-muted max-w-xs animate-fade-in font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
