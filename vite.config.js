import {defineConfig} from 'vite';
import {resolve} from 'path';
import {ViteImageOptimizer} from 'vite-plugin-image-optimizer';
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets';


export default defineConfig({
    root: '.', // корень проекта
    build: {
        target: 'esnext', // Указываем, на какую версию JS ориентироваться
        cssCodeSplit: true, // Разделяем CSS на отдельные файлы
        sourcemap: true, // Включаем карты кода для отладки
        minify: 'terser', // Минифицируем код для уменьшения размера бандла
        outDir: 'dist',     // папка для сборки
        emptyOutDir: true,  // очистка dist перед сборкой
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index_vite.html'), // Главная страница
                admin: resolve(__dirname, 'admin.html') // Страница администратора
            }, // точка входа — index_vite.html
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor'; // Вынесем зависимости в отдельный файл
                    }
                }
            }
        },
        plugins: [
            ViteImageOptimizer({
                test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
                png: {quality: 80},
                jpeg: {quality: 75},
                webp: {lossless: true}
            }),
            libAssetsPlugin({ limit: 8192, outputPath: 'assets' })
        ]
    },
    server: {
        open: true,     // автоматически открывать страницу в браузере
        port: 3000,     // порт dev-сервера
    },
});
