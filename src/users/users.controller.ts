import { Body, Controller, Get, Patch, Post, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Admin } from 'src/core/guard/admin.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersDropdownDto } from './dto/users-dropdown.dto';
import { UsersPaginatedDto } from './dto/users-paginated.dto';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Admin()
  @Post('create')
  async create(@Body() dto: CreateUserDto, @Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.usersService.create(dto);
      return ResponseHelper.success({ res, data, message: 'User created successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Paginated admin/employee list. Body: { search?, access? }, Query: { page, limit }
  @Admin()
  @Post('paginated')
  async paginated(
    @Body() dto: UsersPaginatedDto,
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.usersService.paginated({ dto, query, req });
      return ResponseHelper.success({ res, data, message: 'Users fetched successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Dropdown list: [{ id, username, access }]. Query: { access? }
  @Get('dropdown')
  async dropdown(@Query() dto: UsersDropdownDto, @Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.usersService.dropdown(dto);
      return ResponseHelper.success({ res, data, message: 'Users dropdown fetched successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

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
