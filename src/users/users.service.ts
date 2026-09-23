import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Users } from 'src/core/orm/entities';
import { UpdateProfileDto } from './dto/update-profile.dto';

const PROFILE_SELECT = ['id', 'username', 'email', 'contact', 'cnic', 'profile'] as const;

@Injectable()
export class UsersService {
  constructor() {}

  async getProfile(userId: number) {
    const user = await Users.query().findById(userId).select(...PROFILE_SELECT);
    if (!user) {
      throw new HttpException(
        { statusCode: HttpStatus.NOT_FOUND, message: ['User not found'], error: 'Not Found' },
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    return Users.query().patchAndFetchById(userId, dto).select(...PROFILE_SELECT);
  }
}
