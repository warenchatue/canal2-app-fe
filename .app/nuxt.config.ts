import { isProduction } from 'std-env'

import { appRules, landingRules } from './config/routes-rules'

export default defineNuxtConfig({
  ssr: true,
  extends: [
    '../layers/landing',
    '../layers/tairo-layout-collapse',
    '../layers/tairo',
  ],
  modules: ['nuxt-swiper', '@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt'],

  imports: {
    dirs: ['./stores'],
  },

  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate'],
  },
  css: ['~/assets/css/colors.css'],

  experimental: {
    watcher: 'parcel',
    writeEarlyHints: true,
    renderJsonPayloads: true,
  },

  // nuxt behavior configuration
  runtimeConfig: {
    env: {
      apiUrl: process.env.NUXT_ENV_API_URL || 'http://localhost:8700',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
    public: {
      // mapbox config
      mapboxToken: process.env.NUXT_PUBLIC_MAPBOX_TOKEN,
      // nuxt-seo-kit config
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      siteName: 'DinoEs by Digital Innova',
      siteDescription: 'ERP platform',
      language: 'fr',
    },
  },
  routeRules: {
    ...appRules,
    ...landingRules,
  },

  // build configuration
  hooks: {
    'vite:extendConfig'(config, { isClient }) {
      if (isProduction && isClient) {
        // @ts-ignore
        config.build.rollupOptions.output.entryFileNames = '_nuxt/e/[hash].js'
        // @ts-ignore
        config.build.rollupOptions.output.chunkFileNames = '_nuxt/c/[hash].js'
        // @ts-ignore
        config.build.rollupOptions.output.assetFileNames =
          '_nuxt/a/[hash][extname]'
      }
    },
  },
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/'],
    },
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
  vite: {
    define: {
      'process.test': false,
      // This is required for shiki to work (used to render markdown code blocks)
      'process.env.VSCODE_TEXTMATE_DEBUG': false,
      // This enables vue-axe to work (used to check a11y - see .demo/plugins/vue-axe.ts)
      'process.env.ENABLE_A11Y_AXE': process.env.ENABLE_A11Y_AXE,
    },
    build: {
      target: 'esnext',
    },
  },

  // nuxt modules configuration
  unfonts: {
    google: {
      families: ['Roboto Flex', 'Inter', 'Karla', 'Fira Code'],
    },
  },
  linkChecker: {
    failOn404: true,
  },
  unhead: {
    seoOptimise: false,
  },
})
