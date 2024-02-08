import { isProduction } from 'std-env'

const staticAssetsRule = isProduction
  ? {
      headers: {
        'Cache-Control': 'public, max-age=0',
      },
    }
  : {}

const staticPageRule = isProduction
  ? {
      prerender: false,
      cache: {
        maxAge: 3600,
        swr: true,
        staleMaxAge: 3600,
      },
      headers: {
        'Cache-Control':
          'public, max-age=0, s-maxage=0, stale-while-revalidate=3600, stale-if-error=3600',
      },
    }
  : {}

export const appRules = {
  '/img/**': staticAssetsRule,
  '/shiki/**': staticAssetsRule,
  '/api/**': staticAssetsRule,
}

export const landingRules = {
  '/_ipx/**': staticAssetsRule,
  '/': staticPageRule,
}
