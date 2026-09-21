import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ExternalApiService {
  async get({ url, headers }): Promise<any> {
    try {
      const response = await axios.get(url, {
        headers,
      });
      return response?.data;
    } catch (error) {
      console.error('Error fetching data:', error?.message);
    }
  }

  async post({ url, headers, body }): Promise<any> {
    try {
      const response = await axios.post(url, body, {
        headers,
      });
      return response?.data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
