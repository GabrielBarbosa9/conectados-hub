import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if app is already installed/standalone
        const isAppStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone
            || document.referrer.includes('android-app://');

        setIsStandalone(isAppStandalone);

        if (isAppStandalone) return;

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIOSDevice);

        if (isIOSDevice) {
            // Show iOS prompt after a small delay to not be too aggressive
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        }

        // Chrome/Android install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleClose = () => {
        setShowPrompt(false);
    };

    if (!showPrompt || isStandalone) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card text-card-foreground border rounded-xl shadow-lg p-4 z-50 flex flex-col gap-3 animate-slide-up">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <Download className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Instalar App</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Adicione o Conectados Hub à sua tela inicial para uma melhor experiência.</p>
                    </div>
                </div>
                <button
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="mt-2 text-sm flex gap-2">
                {isIOS ? (
                    <div className="text-xs bg-muted/50 p-3 rounded-lg flex-1">
                        Para instalar, toque em <span className="font-bold">Compartilhar</span> no menu do Safari e depois em <span className="font-bold">Adicionar à Tela de Início</span>.
                    </div>
                ) : (
                    <Button onClick={handleInstallClick} className="w-full" size="sm">
                        Instalar Agora
                    </Button>
                )}
            </div>
        </div>
    );
};
