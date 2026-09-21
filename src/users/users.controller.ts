import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { AuthId } from 'src/core/decorators/auth-id.decorator';
import { JwtAuthGuard } from 'src/core/guard/jwt-auth.guard';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { GlobalSearchDto } from './dto/global-search.dto';
import { EditProfileDto, SetPersonalInfoDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
