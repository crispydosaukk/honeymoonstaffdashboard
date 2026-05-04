import axios from 'axios';

/**
 * Ported logic from Firebase Functions: sendpushnotification
 * NOTE: Sending FCM from the frontend requires a Server Key or OAuth2 Token.
 * Storing a Server Key in the frontend is a security risk.
 * This is provided to "preserve" the logic as requested.
 */
export const sendPushNotification = async (notificationData) => {
    const { fcm_token, title, body, priority, type, notificationId } = notificationData;

    if (!fcm_token) {
        console.warn("[FCM] No FCM token provided, skipping push.");
        return;
    }

    // This would normally be done in a Cloud Function to keep the key secret.
    // To make this work from the frontend, you'd need a Server Key or similar.
    const FCM_SERVER_KEY = import.meta.env.VITE_FCM_SERVER_KEY; 

    if (!FCM_SERVER_KEY) {
        console.error("[FCM] Missing VITE_FCM_SERVER_KEY in .env. Cannot send push notification from frontend.");
        return;
    }

    const message = {
        to: fcm_token,
        notification: {
            title: title,
            body: body,
            sound: "default"
        },
        data: {
            notificationId: notificationId || "",
            type: type || 'announcement',
            priority: priority || 'normal',
        },
        android: {
            priority: priority === 'urgent' ? 'high' : 'normal',
            notification: {
                channel_id: 'default',
                priority: 'max',
                sound: 'default'
            }
        },
        apns: {
            payload: {
                aps: {
                    alert: {
                        title: title,
                        body: body,
                    },
                    sound: 'default',
                    badge: 1,
                }
            }
        }
    };

    try {
        const response = await axios.post('https://fcm.googleapis.com/fcm/send', message, {
            headers: {
                'Authorization': `key=${FCM_SERVER_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('[FCM] Successfully sent push notification from frontend:', response.data);
    } catch (error) {
        console.error('[FCM] Error sending push notification from frontend:', error);
    }
};
