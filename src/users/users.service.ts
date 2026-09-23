import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ExternalApiService } from 'src/core/external-api/external-api.service';
import { Address, Users } from 'src/core/orm/entities';
import { UpdateProfileDto } from './dto/update-profile.dto';


@Injectable()
export class UsersService {
  constructor(private readonly externalApiService: ExternalApiService) {}

  // ─── GET PROFILE ─────────────────────────────────────────────────────────────

  async getProfile(userId: number) {
    const user = await Users.query().withGraphFetched('[address]').findById(userId);
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
    let resolveAddressId:any = null;
   if(dto?.latitude & dto?.longitude){
     resolveAddressId = await this.resolveAddressId(dto.latitude, dto.longitude);
   }
  

    return Users.query().patchAndFetchById(userId, {
      username: dto.username,
      email: dto.email,
      contact: dto.contact,
      profile: dto.profile,
      address:resolveAddressId,
    });
  }

  private async resolveAddressId(latitude: number, longitude: number): Promise<number> {
    const existing: any = await Address.query()
      .where('latitude', latitude)
      .where('longitude', longitude)
      .first();

    if (existing) return existing.id;

    // Step 2: reverse-geocode OUTSIDE transaction to avoid holding DB connection
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
              if (doubleCheck) return doubleCheck;

              let newAddress:any = Address.query().insertAndFetch(addressPayload);
      return newAddress?.id;

  }
}
