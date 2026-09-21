import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { GlobalHelper } from '../helper/global-helper';
import {
  allFileFilter,
  audioFileFilter,
  editFileName,
  fileFilterAll,
  imageAndVideoFileFilter,
  imageFileFilter,
} from '../helper/upload-files-validation';

export class InterceptorHelper {
  static globalFileInterceptorForImage({ fieldName, destination }) {
    return FileInterceptor(fieldName, {
      storage: diskStorage({ destination, filename: editFileName }),
      fileFilter: imageFileFilter,
    });
  }

  static globalFileInterceptorAll({ fieldName, destination }) {
    return FileInterceptor(fieldName, {
      storage: diskStorage({ destination, filename: editFileName }),
      fileFilter: allFileFilter,
    });
  }

  static globalFileInterceptorMultiple({
    fieldNames,
    validations,
    destination,
  }) {
    return FileFieldsInterceptor(fieldNames, {
      storage: diskStorage({ destination, filename: editFileName }),
      fileFilter: (req, file, cb) => {
        GlobalHelper.uploadFile(req, file, cb, validations);
      },
    });
  }

  static s3GlobalFileInterceptorMultiple({
    fieldNames,
    validations,
  }) {
    return FileFieldsInterceptor(fieldNames, {
      fileFilter: (req, file, cb) => {
        GlobalHelper.uploadFile(req, file, cb, validations);
      },
    });
  }

  static globalFileInterceptorForAudio({ fieldName, destination }) {
    return FileInterceptor(fieldName, {
      storage: diskStorage({ destination, filename: editFileName }),
      fileFilter: audioFileFilter,
    });
  }

  static globalFileInterceptorForFile(fieldName: string, destination: string) {
    return FileInterceptor(fieldName, {
      storage: diskStorage({ destination, filename: editFileName }),
      fileFilter: fileFilterAll,
    });
  }

  static globalFileInterceptorImageAndVideo({ fieldName, destination }) {
    return FileInterceptor(fieldName, {
      storage: diskStorage({ destination, filename: editFileName }),
      fileFilter: imageAndVideoFileFilter,
    });
  }
}
