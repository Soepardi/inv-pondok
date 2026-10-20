<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageHelper
{
    /**
     * Simpan dan kompresi file gambar.
     * Menggunakan ekstensi GD jika aktif untuk resize ke max 1280px dan kompresi WebP/JPEG (kualitas 80%).
     * Jika GD tidak aktif atau bukan gambar, menggunakan standar $file->store().
     */
    public static function storeCompressed(UploadedFile $file, string $folder = 'items', string $disk = 'public'): string
    {
        // Validasi ketat: Hanya izinkan JPG, PNG, dan WEBP (blokir GIF, SVG, dsb untuk keamanan)
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedMimes, true)) {
            throw new \InvalidArgumentException('Format gambar tidak didukung! Hanya JPG, PNG, dan WEBP yang diizinkan.');
        }

        // Jika ekstensi GD tidak aktif, fallback ke penyimpanan standar
        if (!extension_loaded('gd')) {
            return $file->store($folder, $disk);
        }

        try {
            $info = @getimagesize($file->getRealPath());
            if (!$info) {
                return $file->store($folder, $disk);
            }

            [$width, $height, $type] = $info;

            // Buat GD image object dari sumber file
            $sourceImage = match ($type) {
                IMAGETYPE_JPEG => @imagecreatefromjpeg($file->getRealPath()),
                IMAGETYPE_PNG => @imagecreatefrompng($file->getRealPath()),
                IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($file->getRealPath()) : null,
                default => null,
            };

            if (!$sourceImage) {
                return $file->store($folder, $disk);
            }

            // Skala dimensi jika melebihi batas maksimal (1280px)
            $maxWidth = 1280;
            $maxHeight = 1280;

            if ($width > $maxWidth || $height > $maxHeight) {
                $ratio = min($maxWidth / $width, $maxHeight / $height);
                $newWidth = (int) round($width * $ratio);
                $newHeight = (int) round($height * $ratio);

                $targetImage = imagecreatetruecolor($newWidth, $newHeight);

                // Pertahankan alpha channel untuk PNG/WebP
                imagealphablending($targetImage, false);
                imagesavealpha($targetImage, true);

                imagecopyresampled($targetImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
                imagedestroy($sourceImage);
                $sourceImage = $targetImage;
            }

            // Export ke WebP jika didukung, atau fallback ke JPEG
            $randomName = Str::random(40);
            ob_start();
            if (function_exists('imagewebp')) {
                imagewebp($sourceImage, null, 80);
                $contents = ob_get_clean();
                $path = $folder . '/' . $randomName . '.webp';
            } else {
                imagejpeg($sourceImage, null, 80);
                $contents = ob_get_clean();
                $path = $folder . '/' . $randomName . '.jpg';
            }
            imagedestroy($sourceImage);

            if (!empty($contents)) {
                Storage::disk($disk)->put($path, $contents);
                return $path;
            }
        } catch (\Throwable $e) {
            // Jika ada kesalahan teknis saat kompresi, fallback ke penyimpanan standar
        }

        return $file->store($folder, $disk);
    }
}
