import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';

const NOMINATIM_TIMEOUT_MS = 8000;

@Injectable()
export class ExternalApiService {
  async get({ url, headers }): Promise<any> {
    try {
      const response = await axios.get(url, { headers });
      return response?.data;
    } catch (error) {
      console.error('Error fetching data:', error?.message);
    }
  }

  async post({ url, headers, body }): Promise<any> {
    try {
      const response = await axios.post(url, body, { headers });
      return response?.data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Nominatim reverse-geocoding
   * Returns null on any failure instead of throwing, so caller can decide.
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<any | null> {
    const appName = process.env.APP_NAME || 'PMS-NestJS';
    const contactEmail = process.env.APP_CONTACT_EMAIL || process.env.TEST_USER_EMAIL || 'admin@pms.local';
    const userAgent = `${appName}/1.0 (${contactEmail})`;

    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?lat=${latitude}&lon=${longitude}&format=jsonv2&addressdetails=1`;

    try {
      const response = await axios.get(url, {
        timeout: NOMINATIM_TIMEOUT_MS,
        headers: {
          'User-Agent': userAgent,
          Accept: 'application/json',
        },
      });

      const data = response?.data;
      if (!data || !data.address) {
        throw new Error('Empty or malformed response from Nominatim');
      }
      return data;
    } catch (error) {
      console.error('[Nominatim] reverse-geocode failed:', error?.message);
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_GATEWAY,
          message: ['Failed to reverse-geocode coordinates. Please try again later.'],
          error: 'Bad Gateway',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
