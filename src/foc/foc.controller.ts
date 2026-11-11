import {
  Body,
  Controller,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthId } from 'src/core/decorators/auth-id.decorator';
import { JwtAuthGuard } from 'src/core/guard/jwt-auth.guard';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { InterceptorHelper } from 'src/core/interceptors/files-interceptor';
import { CreateFocDto } from './dto/create-foc.dto';
import { FocListDto } from './dto/foc-list.dto';
import { FocPaginatedDto } from './dto/foc-paginated.dto';
import { FOC_UPLOAD_DIR, FocService } from './foc.service';

@Controller('api/foc')
@UseGuards(JwtAuthGuard)
export class FocController {
  constructor(private readonly focService: FocService) {}

  @Post('/paginated')
  async paginated(
    @Body() dto: FocPaginatedDto,
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.focService.paginated({ dto, query, req });
      return ResponseHelper.success({
        res,
        data,
        message: 'FOC records fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // FOC Cards list (admin panel). Body: { search? }, Query: { page, limit }
  @Post('/list')
  async list(
    @Body() dto: FocListDto,
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.focService.list({ dto, query, req });
      return ResponseHelper.success({
        res,
        data,
        message: 'FOC cards fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // FOC Vehicles (QR code usage) list. Body: { search? }, Query: { page, limit }
  @Post('/qr-codes')
  async qrCodes(
    @Body() dto: FocListDto,
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.focService.qrCodes({ dto, query, req });
      return ResponseHelper.success({
        res,
        data,
        message: 'FOC QR codes fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Create FOC card. multipart/form-data, optional image field: profilePic
  @Post('/create')
  @UseInterceptors(
    InterceptorHelper.globalFileInterceptorForImage({
      fieldName: 'profilePic',
      destination: FOC_UPLOAD_DIR,
    }),
  )
  async create(
    @Body() dto: CreateFocDto,
    @UploadedFile() file: any,
    @AuthId() authId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.focService.create(dto, file, authId);
      return ResponseHelper.success({
        res,
        data,
        message: 'FOC card created successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
