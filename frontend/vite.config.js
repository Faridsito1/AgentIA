import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
    plugins: [
        vue({
            template: { transformAssetUrls }
        }),
        quasar({
            sassVariables: path.resolve(__dirname, 'src/quasar-variables.sass')
        })
    ],
    resolve: {
        alias: {
            'src': path.resolve(__dirname, 'src')
        }
    },
    css: {
        preprocessorOptions: {
            sass: {
                includePaths: [path.resolve(__dirname)]
            }
        }
    }
})
