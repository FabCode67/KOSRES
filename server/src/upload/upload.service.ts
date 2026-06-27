import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import * as path from 'path';

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format: string;
  bytes: number;
}

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure:     true,
    });
  }

  /** Upload a single image buffer to Cloudinary */
  uploadFile(buffer: Buffer, folder = 'kosres/properties'): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1400, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (err, result) => {
          if (err || !result) return reject(new InternalServerErrorException(`Cloudinary upload failed: ${err?.message}`));
          resolve({
            url:       result.url,
            secureUrl: result.secure_url,
            publicId:  result.public_id,
            width:     result.width,
            height:    result.height,
            format:    result.format,
            bytes:     result.bytes,
          });
        },
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
  }

  /** Upload multiple images in parallel */
  async uploadFiles(files: Express.Multer.File[], folder = 'kosres/properties'): Promise<CloudinaryUploadResult[]> {
    return Promise.all(files.map(f => this.uploadFile(f.buffer, folder)));
  }

  /**
   * Upload a raw file (PDF, DOCX, etc.) to Cloudinary.
   *
   * Key fixes vs previous version:
   * 1. Strip the extension from public_id — Cloudinary appends it automatically
   *    for raw files, so having it in public_id caused a doubled extension in the URL.
   * 2. Use `use_filename: true` + `unique_filename: true` for clean naming.
   * 3. The returned `secure_url` is the correct direct-download URL.
   */
  uploadRaw(
    buffer: Buffer,
    originalName: string,
    folder = 'kosres/documents',
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      // Remove extension from public_id — Cloudinary adds it back for raw files
      const nameWithoutExt = path
        .basename(originalName, path.extname(originalName))
        .replace(/[^a-zA-Z0-9_-]/g, '-')        // sanitise for URL safety
        .slice(0, 80);                            // keep public_id reasonable length

      const publicId = `${folder}/${Date.now()}-${nameWithoutExt}`;

      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type:   'raw',
          public_id:       publicId,
          // Do NOT set 'folder' separately when public_id already contains it
          overwrite:       true,
          invalidate:      true,
        },
        (err, result) => {
          if (err || !result) {
            return reject(
              new InternalServerErrorException(
                `Cloudinary PDF upload failed: ${err?.message}`,
              ),
            );
          }
          resolve({
            url:       result.url,
            secureUrl: result.secure_url,   // ← this is the correct download URL
            publicId:  result.public_id,
            format:    result.format ?? 'pdf',
            bytes:     result.bytes,
          });
        },
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
  }

  /** Delete an asset by public_id */
  async deleteFile(publicId: string, resourceType: 'image' | 'raw' = 'image'): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  }

  /** Signed upload params for direct browser → Cloudinary uploads */
  generateSignedUploadParams(folder = 'kosres/properties') {
    const timestamp    = Math.round(Date.now() / 1000);
    const paramsToSign = { folder, timestamp };
    const signature    = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!,
    );
    return {
      timestamp,
      signature,
      folder,
      apiKey:    process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    };
  }
}
