import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import fs from 'fs';

const phpBinary = fs.existsSync('C:/php/php.exe') ? 'C:/php/php.exe' : 'php';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        wayfinder({
            command: `${phpBinary} artisan wayfinder:generate`,
            formVariants: true,
        }),
    ],
    server: {
        host: '127.0.0.1',
        port: 5173,
    },
    esbuild: {
        jsx: 'automatic',
    },
});
