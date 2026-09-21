import { CustomLoggerService } from 'src/core/logger/custom-logger.service';

const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert({}),
});

export class FcmHelper {
  static async sendMessageNotification({ deviceTokens, data, notification }) {
    const messages = deviceTokens.map((token) => ({
      token,
      notification: notification,
      data: data,
    }));
    try {
      admin
        .messaging()
        .sendEach(messages)
        .then((response) => {
          response.responses.forEach(async (res, idx) => {
            if (!res.success) {
              await CustomLoggerService.errorStatic({
                userId: null,
                method: 'fcm',
                url: messages[idx].token,
                message: res.error.message,
              });
            }
          });
        })
        .catch(async (error) => {
          await CustomLoggerService.errorStatic({
            userId: null,
            method: 'fcm',
            url: 'Critical error sending messages:',
            message: error,
          });
        });
      return true;
    } catch (error) {
      await CustomLoggerService.errorStatic({
        userId: null,
        method: 'fcm',
        url: 'Error sending multicast message:',
        message: error,
      });
      return false;
    }
  }
}
