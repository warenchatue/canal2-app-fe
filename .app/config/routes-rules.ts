import { isProduction } from 'std-env'

const staticAssetsRule = isProduction
  ? {
      headers: {
        'Cache-Control': 'public, max-age=31536000',
      },
    }
  : {}

const staticPageRule = isProduction
  ? {
      // prerender: false,
      // cache: {
      //   maxAge: 0,
      //   swr: false,
      //   staleMaxAge: -1,
      // },
      headers: {
        'Cache-Control':
          'public, max-age=0, s-maxage=0, stale-while-revalidate=0, stale-if-error=0',
      },
    }
  : {}

export const appRules = {
  '/img/**': staticAssetsRule,
  '/shiki/**': staticAssetsRule,
  '/api/**': staticAssetsRule,
  '/dashboards': staticPageRule,
  '/bo/pub': staticPageRule,
  '/bo/pub/**': staticPageRule,
  '/bo/sales': staticPageRule,
  '/bo/sales/**': staticPageRule,
  '/bo/accountancy/': staticPageRule,
  '/bo/accountancy/**': staticPageRule,
  '/bo/config/**': staticPageRule,
  '/bo/admin/**': staticPageRule,
  '/bo/profile/**': staticPageRule,
  '/auth/**': staticPageRule,
}

export const landingRules = {
  '/_ipx/**': staticAssetsRule,
  '/': staticPageRule,
  '/contact': staticPageRule,
  '/about': staticPageRule,
}
