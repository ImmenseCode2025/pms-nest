import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ExternalApiService } from 'src/core/external-api/external-api.service';
import { FERNET_KEY } from 'src/auth/auth.service';
import { AppException } from 'src/core/exception/app-exception';
import { Address, Users } from 'src/core/orm/entities';
import { ParkingSite } from 'src/core/orm/entities/parking-site.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const fernet = require('fernet');

@Injectable()
export class UsersService {
  constructor(private readonly externalApiService: ExternalApiService) {}

  // ─── GET PROFILE ─────────────────────────────────────────────────────────────

  async getProfile(userId: number) {
    const user = await Users.query().withGraphFetched('[userAddress]').findById(userId);
    if (!user) {
      throw new HttpException(
        { statusCode: HttpStatus.NOT_FOUND, message: ['User not found'], error: 'Not Found' },
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  // ─── CREATE USER (admin only) ────────────────────────────────────────────────

  async create(dto: CreateUserDto) {
    const emailExists = await Users.query().where('email', dto.email.trim()).first();
    if (emailExists) {
      AppException.badRequest({ message: 'Email already exists' });
    }

    const cnicExists = await Users.query().where('cnic', dto.cnic).first();
    if (cnicExists) {
      AppException.badRequest({ message: 'CNIC already exists' });
    }

    const site = await ParkingSite.query().findById(dto.site);
    if (!site) {
      AppException.notFound({ message: `Parking site #${dto.site} not found` });
    }

    const payload: Record<string, any> = {
      username: dto.username,
      email: dto.email.trim(),
      contact: dto.contact,
      cnic: dto.cnic,
      password: this.encryptPassword(dto.password),
      access: dto.access,
      user_type: dto.access === 'admin' ? 'Admin' : 'User',
      site: dto.site,
      profile: dto.profile,
      status: 'completed',
      creationSource: 'manual',
    };

    if (
      dto?.latitude !== undefined &&
      dto?.latitude !== null &&
      dto?.longitude !== undefined &&
      dto?.longitude !== null
    ) {
      payload.address = await this.resolveAddressId(dto.latitude, dto.longitude);
    }

    return Users.query().insertAndFetch(payload);
  }

  // Same Fernet scheme AuthService uses to verify passwords
  private encryptPassword(password: string): string {
    const secret = new fernet.Secret(FERNET_KEY);
    const token = new fernet.Token({ secret, time: Date.now() });
    return token.encode(password);
  }

  // ─── UPDATE PROFILE ───────────────────────────────────────────────────────────

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const patchPayload: Record<string, any> = {
      username: dto.username,
      email: dto.email,
      contact: dto.contact,
      profile: dto.profile,
    };

    if (
      dto?.latitude !== undefined &&
      dto?.latitude !== null &&
      dto?.longitude !== undefined &&
      dto?.longitude !== null
    ) {
      const addressId = await this.resolveAddressId(dto.latitude, dto.longitude);
      if (addressId) {
        patchPayload.address = addressId;
      }
    }

    return Users.query().patchAndFetchById(userId, patchPayload);
  }

  private async resolveAddressId(latitude: number, longitude: number): Promise<number> {
    const existing: any = await Address.query()
      .where('latitude', latitude)
      .where('longitude', longitude)
      .first();

    if (existing) return existing.id;

    // Step 2: reverse-geocode
    const geoData = await this.externalApiService.reverseGeocode(latitude, longitude);
    const addr = geoData.address ?? {};

    const addressPayload = {
      name: geoData.display_name ?? geoData.name ?? null,
      city: addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.road ?? null,
      state: addr.state ?? addr.state_district ?? addr.city_district ?? null,
      country: addr.country ?? null,
      zipCode: addr.postcode ?? null,
      latitude,
      longitude,
    };

    const doubleCheck: any = await Address.query()
      .where('latitude', latitude)
      .where('longitude', longitude)
      .first();
    if (doubleCheck) return doubleCheck.id;

    const newAddress: any = await Address.query().insertAndFetch(addressPayload);
    return newAddress?.id;
  }
}
