// importScripts("https://0128343745cf.ngrok-free.app/webroot/serviceWorker.js");

self.addEventListener('push', function (event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    const sendNotification = async (payload) => {
        // Show the notification
        const notification = await self.registration.showNotification(
            payload.title || "Default title",
            {
                body: payload.message,
                icon: payload.icon,
                badge: payload.badge,
                image: payload.image,
                data: { 
                    ...payload.extraData, 
                    url: payload.url,
                    image: payload.image,
                }/* ,
                actions: [
                    {
                        action: 'open',      
                        title: 'Open Website', 
                        icon: 'https://picsum.photos/48'
                    },
                    {
                        action: 'dismiss',
                        title: 'Dismiss',
                        icon: 'https://picsum.photos/48'
                    }
                ] */
            }
        );

        // Send delivery callback after showing notification
        try {
            await fetch("https://0128343745cf.ngrok-free.app/callbacks/web-push/callbacks/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    event: 2,
                    title: payload.title,
                    body: payload.message,
                    data: payload.extraData || {}
                })
            });
        } catch (err) {
            console.error("Delivery callback failed:", err);
        }

        return notification;
    };

    if (event.data) {
        const payload = event.data.json();
        event.waitUntil(sendNotification(payload));
    }
});




self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const notificationData = event.notification.data || {};
    const urlToOpen = notificationData?.url || "https://www.google.com/";

    // Send callback with the notification data
    event.waitUntil(
        (async () => {
            try {
                await fetch("https://0128343745cf.ngrok-free.app/callbacks/web-push/callbacks/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        event: 3,
                        title: event.notification.title,
                        body: event.notification.body,
                        data: notificationData || {}
                    })
                });
            } catch (err) {
                console.error("Clicked callback failed:", err);
            }

            const windowClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
            
            // If a window with the URL is already open, just focus it
            for (let client of windowClients) {
                if (client.url === urlToOpen && "focus" in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })()
    );
});








