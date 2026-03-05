'use client';

/**
 * Smart Shimmer + Scanner Loading Effects
 *
 * 1. SmartShimmer — gradient sweep that looks like AI analyzing data
 * 2. ScannerLine — vertical line that moves down, building trust
 * 3. AnalyzingPulse — circular pulse with status text
 */

interface ShimmerProps {
    className?: string;
    width?: string;
    height?: string;
}

export function SmartShimmer({ className = '', width = '100%', height = '200px' }: ShimmerProps) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl ${className}`}
            style={{ width, height }}
        >
            <div className="absolute inset-0 bg-white/[0.03]" />
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.08) 50%, transparent 100%)',
                    animation: 'shimmerSweep 2s ease-in-out infinite',
                }}
            />
            <style jsx>{`
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    );
}

export function ScannerLine({ className = '' }: { className?: string }) {
    return (
        <div className={`relative overflow-hidden ${className}`}>
            <div
                className="absolute left-0 right-0 h-[2px]"
                style={{
                    background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                    boxShadow: '0 0 12px rgba(59,130,246,0.4)',
                    animation: 'scanDown 3s ease-in-out infinite',
                }}
            />
            <style jsx>{`
        @keyframes scanDown {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
        </div>
    );
}

export function AnalyzingPulse({ status = 'Analyzing...' }: { status?: string }) {
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
                <div
                    className="absolute inset-0 rounded-full border border-primary-500/30"
                    style={{ animation: 'pulseRing 2s ease-out infinite' }}
                />
                <div
                    className="absolute inset-2 rounded-full border border-primary-500/20"
                    style={{ animation: 'pulseRing 2s ease-out infinite 0.5s' }}
                />
                <div
                    className="absolute inset-4 rounded-full border border-primary-500/10"
                    style={{ animation: 'pulseRing 2s ease-out infinite 1s' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse" />
                </div>
            </div>
            <p className="text-xs text-surface-100/40 animate-pulse">{status}</p>
            <style jsx>{`
        @keyframes pulseRing {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
        </div>
    );
}

/**
 * Theme provider for dark/light mode sync with OS.
 */
export function ThemeScript() {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `
          (function() {
            try {
              var theme = localStorage.getItem('aihealz-theme');
              if (!theme) theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              document.documentElement.setAttribute('data-theme', theme);
              document.documentElement.classList.toggle('dark', theme === 'dark');
            } catch(e) {}
          })();
        `,
            }}
        />
    );
}
