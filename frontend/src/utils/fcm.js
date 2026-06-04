import { functionsInstance } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';

export const sendPushNotification = async (notificationData) => {
    try {
        const sendPush = httpsCallable(functionsInstance, 'sendPushNotification');
        const response = await sendPush(notificationData);
        console.log('[FCM] Successfully sent push notification via Cloud Function:', response.data);
    } catch (error) {
        console.error('[FCM] Error sending push notification via Cloud Function:', error);
    }
};
