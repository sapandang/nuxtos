import { fileURLToPath } from 'node:url'
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      meta: [
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1.0, interactive-widget=resizes-content'
        }
      ]
    }
  },
  components: [
    { path: fileURLToPath(new URL('./app/components/os', import.meta.url)), pathPrefix: false }
  ],
  css: [fileURLToPath(new URL('./app/assets/css/main.css', import.meta.url))],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
