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
        const sevenDays = 1 * 24 * 60 * 60 * 1000;
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
                '📱 To install VegeBazar on iOS:\n\n' +
                '1. Tap the Share button (box with arrow)\n' +
                '2. Scroll down and tap "Add to Home Screen"\n' +
                '3. Tap "Add" to confirm'
            );
            return;
        }

        if (!deferredPrompt) {
            // Fallback instructions for other browsers
            alert(
                '📱 To install VegeBazar:\n\n' +
                '• Chrome/Edge: Click menu (⋮) → "Install VegeBazar"\n' +
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
            // // console.log('User accepted the install prompt');
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
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg animate-slide-down border-b-2 border-[#0e540b]">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-2 sm:py-3 gap-2 sm:gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#0e540b]/10 rounded-full flex items-center justify-center animate-bounce-slow border border-[#0e540b]/20">
                            <Smartphone className="w-4 h-4 sm:w-6 sm:h-6 text-[#0e540b]" />
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[#2d3748] font-funnel font-bold text-xs sm:text-base leading-tight mt-0.5">
                            Install <span className="text-[#0e540b]">VegBazar</span> App
                        </h3>
                        <p className="text-[#718096] font-funnel text-[10px] sm:text-sm mt-0 sm:mt-0.5 truncate sm:whitespace-normal">
                            Get existing offers & faster checkout! 🚀
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <button
                            onClick={handleInstallClick}
                            className="bg-[#0e540b] text-white hover:bg-[#0a3d08] px-3 py-1.5 sm:px-5 sm:py-2.5 rounded sm:rounded-lg font-funnel font-semibold text-[11px] sm:text-sm transition-all duration-300 shadow-sm sm:shadow-md hover:shadow-lg flex items-center gap-1 sm:gap-2 transform hover:-translate-y-0.5"
                        >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Install App</span>
                            <span className="sm:hidden">Install</span>
                        </button>

                        <button
                            onClick={handleDismiss}
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#718096] transition-all duration-300 flex items-center justify-center"
                            aria-label="Dismiss"
                        >
                            <X className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallBanner;