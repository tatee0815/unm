/**
 * Tiện ích nén ảnh tự động ngay trên trình duyệt trước khi upload.
 * - Giảm kích thước ảnh xuống chuẩn Web (tối đa Full HD: 1920x1920) giữ nguyên tỷ lệ khung hình.
 * - Nén chất lượng JPEG ở mức 80% (quality: 0.8) giúp giảm 80-90% dung lượng mà mắt thường không phân biệt được.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const compressImage = async (
  file: File | Blob,
  options: CompressOptions = {}
): Promise<File | Blob> => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
  } = options;

  // Nếu không phải định dạng ảnh hoặc là ảnh GIF/SVG thì giữ nguyên để không mất hiệu ứng/vector
  const type = file.type || '';
  if (type === 'image/gif' || type === 'image/svg+xml') {
    return file;
  }

  // Nếu file quá nhỏ (dưới 150KB) thì không cần nén thêm
  if (file.size > 0 && file.size < 150 * 1024) {
    return file;
  }

  try {
    let sourceWidth = 0;
    let sourceHeight = 0;
    let imageSource: CanvasImageSource | null = null;
    let cleanup: (() => void) | null = null;

    if (typeof createImageBitmap === 'function') {
      try {
        const bitmap = await createImageBitmap(file);
        sourceWidth = bitmap.width;
        sourceHeight = bitmap.height;
        imageSource = bitmap;
        cleanup = () => bitmap.close?.();
      } catch {
        // Fallback sang HTMLImageElement nếu createImageBitmap lỗi
      }
    }

    if (!imageSource) {
      const objectUrl = URL.createObjectURL(file);
      cleanup = () => URL.revokeObjectURL(objectUrl);

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = (err) => reject(err);
        image.src = objectUrl;
      });

      sourceWidth = img.naturalWidth || img.width;
      sourceHeight = img.naturalHeight || img.height;
      imageSource = img;
    }

    // Nếu kích thước đã nhỏ hơn ngưỡng Full HD và file đã nhẹ (< 300KB), giữ nguyên
    if (sourceWidth <= maxWidth && sourceHeight <= maxHeight && file.size < 300 * 1024) {
      cleanup?.();
      return file;
    }

    // Tính toán kích thước mới theo tỷ lệ khung hình
    let targetWidth = sourceWidth;
    let targetHeight = sourceHeight;

    if (targetWidth > maxWidth || targetHeight > maxHeight) {
      const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);
    }

    // Vẽ lên Canvas để nén và resize
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      cleanup?.();
      return file;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageSource, 0, 0, targetWidth, targetHeight);
    cleanup?.();

    // Xuất ra Blob định dạng JPEG với chất lượng 80% (quality: 0.8)
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality);
    });

    if (!blob) {
      return file;
    }

    // Chỉ dùng ảnh nén nếu dung lượng thực sự nhỏ hơn file ban đầu
    if (file.size > 0 && blob.size >= file.size) {
      return file;
    }

    // Giữ nguyên tên file gốc nếu là đối tượng File
    const originalName = file instanceof File ? file.name : 'photo.jpg';
    const newName = originalName.replace(/\.[^/.]+$/, '') + '.jpg';

    return new File([blob], newName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn('Không thể nén ảnh, sử dụng ảnh gốc:', error);
    return file;
  }
};
