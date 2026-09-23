import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ExternalApiService } from 'src/core/external-api/external-api.service';
import { Address, Users } from 'src/core/orm/entities';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
