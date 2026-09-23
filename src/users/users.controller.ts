import { Body, Controller, Get, Patch, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.usersService.getProfile(req['userId']);
      return ResponseHelper.success({ res, data, message: 'Profile fetched successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Patch('profile')
  async updateProfile(@Req() req: Request, @Res() res: Response, @Body() dto: UpdateProfileDto) {
    try {
      const data = await this.usersService.updateProfile(req['userId'], dto);
      return ResponseHelper.success({ res, data, message: 'Profile updated successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
