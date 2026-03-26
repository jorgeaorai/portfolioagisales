/**
 * Agisales PWA Core Logic
 * Handles SW registration, connection status, and background sync triggering.
 */

const App = {
    init() {
        this.registerServiceWorker();
        this.statusIndicator();
        this.backgroundSync();
    },

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js').then(reg => {
                    console.log('[PWA] SW Registered');
                    
                    // Detect SW updates
                    reg.onupdatefound = () => {
                        const installingWorker = reg.installing;
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showToast("Nova versão disponível! Reinicie para atualizar.");
                            }
                        };
                    };
                });
            });
        }
    },

    statusIndicator() {
        const updateStatus = () => {
            const isOnline = navigator.onLine;
            document.body.classList.toggle('is-offline', !isOnline);
            if (!isOnline) {
                this.showToast("Modo Offline Ativado", "warning");
            } else {
                this.showToast("Você está online", "success");
                this.triggerSync();
            }
        };

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
    },

    async triggerSync() {
        const queue = await DB.getQueue();
        if (queue.length === 0) return;

        console.log(`[PWA] Syncing ${queue.length} items...`);
        this.showToast("Sincronizando...", "info");

        for (const item of queue) {
            try {
                const response = await fetch(item.url, {
                    method: 'POST',
                    body: item.data,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                if (response.ok) {
                    await DB.removeFromQueue(item.id);
                }
            } catch (err) {
                console.error("[PWA] Sync failed for item:", item.id);
            }
        }

        this.showToast("Sincronização concluída!");
    },

    backgroundSync() {
        // Fallback for browsers that don't support Background Sync API
        setInterval(() => {
            if (navigator.onLine) this.triggerSync();
        }, 60000); // Check every minute
    },

    showToast(message, type = "success") {
        const toast = document.createElement('div');
        toast.className = `pwa-toast ${type}`;
        toast.innerText = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 500);
            }, 3000);
        }, 100);
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
