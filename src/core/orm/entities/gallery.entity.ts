import { Mapping } from 'src/core/orm/sql.model';

export class Gallery extends Mapping {
  static table = 'gallery';

  static gallerySelect = ['id', 'file_path', 'file_type'];

  static modifyGallery(builder) {
    builder.select(...Gallery.gallerySelect);
  }
}
