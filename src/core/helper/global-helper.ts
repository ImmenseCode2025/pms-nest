import { HttpException, HttpStatus } from '@nestjs/common';
import fs from 'fs';
import { join } from 'path';
import { DeviceTokens } from '../orm/entities/device-tokens.entity';
import { Users } from '../orm/entities/users.entity';

var dotenv = require('dotenv');

dotenv.config();

export class GlobalHelper {
  static async changeUserStatus(userId, status) {
    if (userId) {
      await Users.query().updateAndFetchById(userId, { status: status });
      return userId;
    }
    return null;
  }
  static async getFileTypeFromUrl(url) {
    if (!url || typeof url !== 'string') return 'unknown';

    try {
      // Remove query parameters and hash fragments
      const cleanUrl = url.split('?')[0].split('#')[0];

      // Extract file extension
      const parts = cleanUrl.split('.');
      if (parts.length <= 1) return 'unknown';

      const ext = parts.pop().toLowerCase();

      // Define extension categories
      const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
      const audioExts = [
        'mp3',
        'wav',
        'ogg',
        'm4a',
        'flac',
        'aac',
        'wma',
        'opus',
        'aiff',
        'amr',
      ];
      const pdfExts = ['pdf'];
      const docExts = ['doc', 'docx'];
      const sheetExts = ['xls', 'xlsx'];

      // Detect file type
      if (imageExts.includes(ext)) return 'image';
      if (videoExts.includes(ext)) return 'video';
      if (audioExts.includes(ext)) return 'audio';
      if (pdfExts.includes(ext)) return 'pdf';
      if (docExts.includes(ext)) return 'document';
      if (sheetExts.includes(ext)) return 'spreadsheet';

      return 'unknown';
    } catch (error) {
      console.error('Error detecting file type:', error.message);
      return 'unknown';
    }
  }

  static slugify(value) {
    return value.toLowerCase().replace(/ /g, '-');
  }

  static async getUserById(userId) {
    let findOne: any = await Users.query().findById(userId);
    return findOne ? findOne : null;
  }

  static async updateDeviceToken({ userId, deviceId, token }) {
    let findOne: any = await DeviceTokens.query()
      .where({
        user_id: userId,
        device_id: deviceId,
      })
      .first();

    if (findOne) {
      await DeviceTokens.query().updateAndFetchById(findOne.id, {
        token: token,
      });
      return true;
    }

    await DeviceTokens.query().insertAndFetch({
      user_id: userId,
      device_id: deviceId,
      token: token,
    });

    return true;
  }
  static async generateOtp() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  static uploadFile(req, file, callback, validation: any) {
    var pregmax = new RegExp(`\\.(${validation[file.fieldname]})$`);
    if (!file.originalname.match(pregmax)) {
      return callback(
        new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: [`only allow ${validation[file.fieldname]}`],
            error: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
    callback(null, true);
  }
  static async userGet({ userId }) {
    let findOne: any = await Users.query().findById(userId);

    return findOne ? findOne : null;
  }

  static async multipleDeviceTokenByUsers({ ids }) {
    let items: any = await DeviceTokens.query().whereIn('user_id', ids);
    let userIdsArray: any[] = items
      .map((x: any) => x.token)
      .filter((token: any) => token !== null);
    return userIdsArray;
  }

  static async deleteFile({ filePath }) {
    try {
      const templatePath = join(process.cwd(), 'public', filePath);
      if (templatePath) {
        await fs.unlinkSync(templatePath);
      }
    } catch (error) {
      return false;
    }
    return true;
  }
}
