import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({}) => {
    // Look for .env in the parent directory (one level up)
    const envDir = path.resolve(__dirname, '..');

    return {
        plugins: [react()],
        // Set the env directory for the entire project
        envDir: envDir,
        server: {
            host: '127.0.0.1',
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@assets': path.resolve(__dirname, './src/assets'),
                '@components': path.resolve(__dirname, './src/components'),
                '@styles': path.resolve(__dirname, './src/styles'),
                '@contexts': path.resolve(__dirname, './src/contexts'),
            },
        },
    };
});
