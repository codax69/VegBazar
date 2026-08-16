// src/components/PWAInstallBanner.jsx — Rebuilt with v2 design system tokens, Fraunces title, and Inter typography
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

const PWAInstallBanner = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if running on iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(iOS);

        // Check if already installed
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;

        // Check if banner was previously dismissed
        const bannerDismissed = localStorage.getItem('pwaInstallBannerDismissed');
        const dismissedTime = localStorage.getItem('pwaInstallBannerDismissedTime');

        // Show banner again after 7 days
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const shouldShowAgain = dismissedTime && (Date.now() - parseInt(dismissedTime)) > sevenDays;

        // Don't show if already installed
        if (isInstalled) {
            return;
        }

        // Don't show if dismissed and shouldn't show again
        if (bannerDismissed && !shouldShowAgain) {
            return;
        }

        // Check if we already captured the event in index.html
        if (window.deferredPrompt) {
            setDeferredPrompt(window.deferredPrompt);
            setShowBanner(true);
        }

        // Listen for the beforeinstallprompt event (in case it fires after mount)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            window.deferredPrompt = e; // Update global
            setDeferredPrompt(e);
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS or if beforeinstallprompt doesn't fire, show banner after delay
        const timer = setTimeout(() => {
            // Only show if not installed and we haven't already shown it via the event
            if (!isInstalled && (!bannerDismissed || shouldShowAgain) && !window.deferredPrompt) {
                setShowBanner(true);
            }
        }, 3000);

        // Cleanup function
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            clearTimeout(timer);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            // Show iOS instructions
            alert(
                '📱 To install VegBazar on iOS:\n\n' +
                '1. Tap the Share button (box with arrow)\n' +
                '2. Scroll down and tap "Add to Home Screen"\n' +
                '3. Tap "Add" to confirm'
            );
            return;
        }

        if (!deferredPrompt) {
            // Fallback instructions for other browsers
            alert(
                '📱 To install VegBazar:\n\n' +
                '• Chrome/Edge: Click menu (⋮) → "Install VegBazar"\n' +
                '• Firefox: Click menu → "Install"\n' +
                '• Safari: Share → "Add to Home Screen"'
            );
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowBanner(false);
        }

        // Clear the deferredPrompt
        setDeferredPrompt(null);
        window.deferredPrompt = null;
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('pwaInstallBannerDismissed', 'true');
        localStorage.setItem('pwaInstallBannerDismissedTime', Date.now().toString());
    };

    // Don't render if banner shouldn't be shown
    if (!showBanner) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] shadow-xs font-body transition-colors duration-150">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-2 sm:py-2.5 gap-2 sm:gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--color-tint-green)] border border-[var(--color-border)] rounded-full flex items-center justify-center">
                            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-brand-green)]" />
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0 font-body">
                        <h3 className="text-[var(--color-text-primary)] font-display font-semibold text-xs sm:text-sm leading-tight">
                            Install <span className="text-[var(--color-brand-green)] font-display font-semibold">VegBazar</span> App
                        </h3>
                        <p className="text-[var(--color-text-secondary)] text-[10px] sm:text-xs mt-0.5 truncate sm:whitespace-normal">
                            Get existing offers & faster checkout! 🚀
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <button
                            onClick={handleInstallClick}
                            className="bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-[10px] font-body font-medium text-xs transition-colors flex items-center gap-1.5"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Install App</span>
                            <span className="sm:hidden">Install</span>
                        </button>

                        <button
                            onClick={handleDismiss}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--color-bg-app)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors flex items-center justify-center"
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallBanner;