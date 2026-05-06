import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';
import env from '../config/env.js';

const uploadBufferToCloudinary = ({ buffer, folder, publicId }) => {
  if (env.nodeEnv === 'test') {
    return Promise.resolve({
      url: `https://res.cloudinary.com/test/image/upload/${folder}/${publicId}`,
      publicId: `${folder}/${publicId}`,
    });
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) {
    return null;
  }

  if (env.nodeEnv === 'test') {
    return {
      result: 'ok',
      publicId,
    };
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
  });
};

export { uploadBufferToCloudinary, deleteFromCloudinary };