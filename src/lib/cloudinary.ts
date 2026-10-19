/**
 * Cloudinary Direct Upload Helper (Unsigned)
 * Cho phép tải ảnh trực tiếp từ trình duyệt lên Cloudinary mà không cần backend và không lộ API Secret.
 */

import { compressImage } from './imageCompressor';

export const uploadToCloudinary = async (file: File | Blob): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Chưa cấu hình VITE_CLOUDINARY_CLOUD_NAME hoặc VITE_CLOUDINARY_UPLOAD_PRESET trong file .env!'
    );
  }

  // Tự động nén ảnh xuống chuẩn Web (Full HD / quality 80%) trước khi gửi
  const fileToUpload = await compressImage(file);

  const formData = new FormData();
  formData.append(
    'file',
    fileToUpload,
    fileToUpload instanceof File ? fileToUpload.name : (file instanceof File ? file.name : 'image.jpg')
  );
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error?.message || `Lỗi tải ảnh lên Cloudinary (${response.status})`
    );
  }

  const data = await response.json();
  return data.secure_url;
};
