import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/core/guard/jwt-auth.guard';
import {
  FileExtensionsEnum
} from 'src/core/helper/enum/global.enum';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { InterceptorHelper } from 'src/core/interceptors/files-interceptor';
import { FileUploadDto } from './dto/files-upload.dto';
import { FilesUploadService } from './files-upload.service';

@Controller('api/files-upload')
export class FilesUploadController {
  constructor(private readonly filesUploadService: FilesUploadService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    InterceptorHelper.s3GlobalFileInterceptorMultiple({
      fieldNames: [{ name: 'media' }],
      validations: { media: FileExtensionsEnum.All },
    }),
  )
  @Post('')
  async uploadFile(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles() files,
    @Body() dto: FileUploadDto,
  ) {
    try {
      const data = await this.filesUploadService.uploadFile(files, dto);
      return ResponseHelper.success({
        res,
        data,
        message: 'File uploaded successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
