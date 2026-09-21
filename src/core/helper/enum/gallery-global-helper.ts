import { Gallery } from "src/core/orm/entities/gallery.entity";

export class GalleryGlobalHelper {

  static async buildGlobalGalleryWithRelatedFiles({
    files,
    galleryableId,
    galleryableType,
    relatedId,
    relatedType,
  }) {
    if (!files || files?.length === 0) {
      return false;
    }
    let filesUpdate: any = await Promise.all(
      files?.map(async (path) => ({
        file_path: path,
        galleryable_id: galleryableId,
        galleryable_type: galleryableType,
        related_id: relatedId,
        related_type: relatedType,
      })),
    );
    await Gallery.query().insertGraph(filesUpdate);
    return true;
  }


  static async updateGlobalBuildGalleryWithRelatedFiles({
    files,
    galleryableId,
    galleryableType,
    relatedId,
    relatedType,
  }) {
    if (!files) {
      return false;
    }
    await Gallery.query()
      .where({
        galleryable_id: galleryableId,
        galleryable_type: galleryableType,
        related_id: relatedId,
        related_type: relatedType,
      })
      .delete();
    if (files?.length == 0) {
      return false;
    }
    let filesUpdate: any = await Promise.all(
      files.map(async (path) => ({
        file_path: path,
        galleryable_id: galleryableId,
        galleryable_type: galleryableType,
        related_id: relatedId,
        related_type: relatedType,

      })),
    );
    await Gallery.query().insertGraph(filesUpdate);
    return true;
  }
}
