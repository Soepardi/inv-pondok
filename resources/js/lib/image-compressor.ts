/**
 * Utility untuk mengompresi gambar di sisi browser (client-side) sebelum diunggah ke server.
 * Mengurangi ukuran file foto (misal dari 5MB kamera HP menjadi ~150-250KB) tanpa mengurangi
 * kualitas tampilan visual secara drastis, sehingga upload sangat cepat dan hemat kuota/storage.
 * 
 * Hanya mengizinkan format JPG, PNG, dan WEBP (menolak GIF dan SVG demi keamanan).
 */

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export function isAllowedImageType(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase());
}

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 sampai 1.0 (default: 0.8)
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const { maxWidth = 1280, maxHeight = 1280, quality = 0.8 } = options;

  // Validasi ketat: Hanya izinkan JPG, PNG, WEBP (blokir GIF, SVG, dll)
  if (!isAllowedImageType(file)) {
    throw new Error("Format file tidak didukung! Hanya gambar JPG, PNG, atau WEBP yang diperbolehkan.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung rasio resolusi maksimal
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        // Gambar ulang dengan ukuran baru
        ctx.drawImage(img, 0, 0, width, height);

        // Pilih format webp (didukung semua browser modern) atau fallback jpeg
        const outputType = "image/webp";

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // Jika hasil kompresi lebih kecil dari aslinya, gunakan hasil kompresi
            if (blob.size < file.size) {
              const extension = outputType === "image/webp" ? ".webp" : ".jpg";
              const newFileName = file.name.replace(/\.[^/.]+$/, "") + extension;

              const compressedFile = new File([blob], newFileName, {
                type: outputType,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              // Jika ukuran file asli sudah sangat kecil, pertahankan file asli
              resolve(file);
            }
          },
          outputType,
          quality
        );
      };

      img.onerror = () => reject(new Error("Gagal membaca file gambar."));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Gagal membuka file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Format ukuran byte ke string yang mudah dibaca (KB / MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
