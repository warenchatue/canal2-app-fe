import { isProduction } from 'std-env'

const staticAssetsRule = isProduction
  ? {
      isr: true,
      headers: {
        'Cache-Control': 'public, max-age=31536000',
      },
    }
  : {}

const staticPageRule = isProduction
  ? {
      prerender: true,
    }
  : {}

const dynamicAPIRule = isProduction
  ? {
      cors: true,
    }
  : {}

const dynamicPageRule = isProduction
  ? {
      prerender: false,
      ssr: true,
    }
  : {}

// const dynamicPageRule = isProduction
//   ? {
//       cache: {
//         swr: false,
//         ssr: false,
//         maxAge: 3600,
//         staleMaxAge: 3600,
//       },
//       headers: {
//         'Cache-Control':
//           'public, max-age=3600, s-maxage=3600, stale-while-revalidate=3600, stale-if-error=3600',
//       },
//     }
//   : {}

export const appRules = {
  '/**': { isr: 60 },
  '/img/**': staticAssetsRule,
  '/shiki/**': staticAssetsRule,
  '/api/**': dynamicAPIRule,
  '/dashboards': dynamicPageRule,
  '/bo/pub': dynamicPageRule,
  '/bo/pub/**': dynamicPageRule,
  '/bo/sales': dynamicPageRule,
  '/bo/sales/**': dynamicPageRule,
  '/bo/accountancy/': dynamicPageRule,
  '/bo/accountancy/**': dynamicPageRule,
  '/bo/config/**': dynamicPageRule,
  '/bo/admin/**': dynamicPageRule,
  '/bo/profile/**': dynamicPageRule,
  '/auth/**': dynamicPageRule,
}

export const landingRules = {
  '/_ipx/**': staticAssetsRule,
  '/': staticPageRule,
  '/contact': staticPageRule,
  '/about': staticPageRule,
}
