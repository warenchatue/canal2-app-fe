/**
 * This file is used to configure the app
 *
 * If you have the "Cannot find name 'defineAppConfig'.ts(2304)" error
 * update the root tsconfig.json file to include the following:
 *
 *  "extends": "./.demo/.nuxt/tsconfig.json"
 *
 */

export default defineAppConfig({
  nuxtIcon: {},
  nui: {
    defaultShapes: {},
  },
  tairo: {
    title: 'DinoEs',
    sidebar: {},
    collapse: {
      toolbar: {
        enabled: true,
        showTitle: true,
        showNavBurger: true,
        tools: [
          {
            component: 'DemoThemeToggle',
          },
          {
            component: 'DemoToolbarLanguage',
          },
          {
            component: 'DemoToolbarNotifications',
          },
          {
            component: 'DemoToolbarActivity',
          },
          {
            component: 'DemoToolbarAccountMenu',
          },
        ],
      },
      circularMenu: {
        enabled: true,
        tools: [
          {
            component: 'DemoThemeToggle',
            props: {
              class: 'ms-auto',
              disableTransitions: true,
              inverted: true,
            },
          },
          {
            component: 'DemoCircularMenuLanguage',
          },
          {
            component: 'DemoCircularMenuNotifications',
          },
          {
            component: 'DemoCircularMenuActivity',
          },
        ],
      },
      navigation: {
        enabled: true,
        header: {
          component: 'DemoCollapseNavigationHeader',
        },
        footer: {
          component: 'DemoCollapseNavigationFooter',
        },
        items: [
          {
            name: 'Accueil',
            icon: { name: 'lucide:home', class: 'w-5 h-5' },
            activePath: '/dashboards',
            children: [
              {
                name: 'Tableau de bord',
                to: '/dashboards',
                icon: { name: 'ph:chart-pie-slice-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Diffusion',
            icon: { name: 'lucide:tv', class: 'w-5 h-5' },
            activePath: '/bo/broadcast',
            children: [
              {
                name: 'Diffusion du jour',
                to: '/bo/broadcast/daily-diffusion-list',
                icon: { name: 'ph:target-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Publicités du Jour',
                to: '/bo/broadcast/pub-daily-diffusion-list',
                icon: { name: 'ph:target-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'PUBLI et INT du Jour',
                to: '/bo/broadcast/publi-int-daily-diffusion-list',
                icon: { name: 'ph:target-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Programmes du jour',
                to: '/bo/broadcast/tv-programs-daily-diffusion-list',
                icon: {
                  name: 'lucide:tv',
                  class: 'w-4 h-4',
                },
              },
            ],
          },

          {
            name: 'PUB',
            icon: { name: 'ph:target-duotone', class: 'w-5 h-5' },
            activePath: '/bo/pub',
            children: [
              {
                name: 'Tableau de bord',
                to: '/bo/pub',
                icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Tous les conducteurs',
                to: '/bo/pub/diffusion-list',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Campagnes PUB',
                to: '/bo/pub/packages',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Suivi campagnes',
                to: '/bo/pub/reports',
                icon: { name: 'lucide:file', class: 'w-4 h-4' },
              },
              {
                name: 'Horaires',
                to: '/bo/pub/hours',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Programmes TV',
            icon: { name: 'ph:target-duotone', class: 'w-5 h-5' },
            activePath: '/bo/tv-programs',
            children: [
              {
                name: 'Tableau de bord',
                to: '/bo/tv-programs',
                icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Tous les conducteurs',
                to: '/bo/tv-programs/diffusion-list',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Planning',
                to: '/bo/tv-programs/planning',
                icon: { name: 'ph:list-checks-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Nos emisions',
                to: '/bo/tv-programs/programs',
                icon: { name: 'ph:list-checks-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Catégories',
                to: '/bo/tv-programs/categories',
                icon: { name: 'ph:list-checks-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Horaires',
                to: '/bo/tv-programs/hours',
                icon: { name: 'ph:list-checks-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Jounalistes',
                to: '/bo/tv-programs/journalists',
                icon: { name: 'ph:users-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Publi / Couvertures',
            icon: { name: 'ph:money-duotone', class: 'w-5 h-5' },
            activePath: '/bo/publi-intervention',
            children: [
              {
                name: 'Tableau de bord',
                // to: '/bo/publi-intervention/broadcast-authorization',
                icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Tous les conducteurs',
                to: '/bo/publi-intervention/diffusion-list',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Autorisation de diffusion',
                to: '/bo/publi-intervention/broadcast-authorization',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Natures',
                to: '/bo/publi-intervention/broadcast-authorization-nature',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Achats',
            icon: { name: 'ph:money-duotone', class: 'w-5 h-5' },
            activePath: '/bo/purchases',
            children: [
              {
                name: 'Tableau de bord',
                // to: '/bo/sales',
                icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Bons de commandes',
                to: '/bo/purchases/orders',
                icon: { name: 'lucide:file', class: 'w-4 h-4' },
              },
              {
                name: 'Factures fournisseurs',
                to: '/bo/purchases/invoices',
                icon: { name: 'lucide:file', class: 'w-4 h-4' },
              },
              {
                name: 'Fournisseurs',
                to: '/bo/purchases/suppliers',
                icon: { name: 'ph:users-duotone', class: 'w-5 h-5' },
              },
              {
                name: 'Paiements effectués',
                // to: '/bo/purchases/payments',
                icon: { name: 'lucide:file', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Ventes',
            icon: { name: 'ph:money-duotone', class: 'w-5 h-5' },
            activePath: '/bo/sales',
            children: [
              {
                name: 'Tableau de bord',
                // to: '/bo/sales',
                icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Devis',
                to: '/bo/sales/orders',
                icon: { name: 'lucide:file', class: 'w-4 h-4' },
              },
              {
                name: 'Factures clients',
                to: '/bo/sales/invoices',
                icon: { name: 'lucide:file', class: 'w-4 h-4' },
              },
              {
                name: 'Paiements reçus',
                to: '/bo/sales/payments',
                icon: { name: 'lucide:file', class: 'w-4 h-4' },
              },
              {
                name: 'Annonceurs',
                icon: { name: 'ph:users-duotone', class: 'w-5 h-5' },
                to: '/bo/sales/announcers',
              },
              {
                name: 'Articles',
                to: '/bo/sales/articles',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: "Categories d'article",
                to: '/bo/sales/articleCategories',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Recouvrement',
            icon: { name: 'ph:money-duotone', class: 'w-5 h-5' },
            activePath: '/bo/sav',
            children: [
              {
                name: 'Tableau de bord',
                // to: '/bo/pub',
                icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Impayés',
                to: '/bo/recovery/invoices',
                icon: { name: 'ph:chat-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Etat des clients',
                to: '/bo/recovery/procedures',
                icon: { name: 'ph:chat-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Comptabilité',
            icon: { name: 'ph:money-duotone', class: 'w-5 h-5' },
            activePath: '/bo/accountancy',
            children: [
              {
                name: 'Tableau de bord',
                // to: '/bo/pub',
                icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Bons de caisse',
                to: '/bo/accountancy/accounting-docs',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Catégories de dépenses',
                to: '/bo/accountancy/expense-categories',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Types de pièces',
                to: '/bo/accountancy/doc-types',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },

              {
                name: 'Etats',
                // to: '/bo/pub/reports',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Fiscalité',
            icon: { name: 'ph:money-duotone', class: 'w-5 h-5' },
            activePath: '/bo/taxation',
            children: [
              {
                name: 'Tableau de bord',
                // to: '/bo/pub',
                icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Déclarations',
                // to: '/bo/accountancy/accounting-docs',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Sociétes',
                // to: '/bo/accountancy/doc-accounts',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          // {
          //   name: 'RH',
          //   icon: { name: 'ph:app-window-duotone', class: 'w-5 h-5' },
          //   activePath: '/bo/sav',
          //   children: [
          //     {
          //       name: 'Tableau de bord',
          //       // to: '/bo/pub',
          //       icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
          //     },
          //     {
          //       name: 'Personnel',
          //       // to: '/bo/accountancy/accounting-docs',
          //       icon: { name: 'ph:users-duotone', class: 'w-4 h-4' },
          //     },
          //     {
          //       name: 'Rapports',
          //       // to: '/bo/pub/reports',
          //       icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
          //     },
          //   ],
          // },
          // {
          {
            name: 'IMMO',
            icon: { name: 'ph:app-window-duotone', class: 'w-5 h-5' },
            activePath: '/bo/sav',
            children: [
              {
                name: 'Tableau de bord',
                // to: '/bo/imo',
                icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Immobilisations',
                to: '/bo/immo/assets',
                icon: { name: 'ph:app-window-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Categories',
                to: '/bo/immo/assets/asset-categories',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Modeles',
                to: '/bo/immo/assets/asset-models',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Marques',
                to: '/bo/immo/assets/asset-brands',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Configuration',
            icon: { name: 'lucide:settings', class: 'w-5 h-5' },
            activePath: '/bo/config',
            children: [
              {
                name: 'Modes de reglement',
                to: '/bo/config/payment-methods',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Conditions de paiement',
                to: '/bo/config/payment-conditions',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Impots et Taxes',
                to: '/bo/config/taxes',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Plan comptable',
                to: '/bo/config/accounts',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Codes journaux',
                to: '/bo/accountancy/journals',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Plan de tiers',
                // to: '/bo/accountancy/third-parties',
                icon: { name: 'ph:money-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Sociétés',
                to: '/bo/admin/orgs',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Admin',
            icon: { name: 'lucide:settings', class: 'w-5 h-5' },
            isAdmin: true,
            activePath: '/bo/admin',
            children: [
              {
                name: 'Utilisateurs',
                to: '/bo/admin/users',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Roles',
                to: '/bo/admin/roles',
                icon: { name: 'ph:list-checks-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Divider',
            divider: true,
          },
          {
            name: 'Profile',
            icon: { name: 'ph:user-duotone', class: 'w-5 h-5' },
            activePath: '/bo/profile',
            children: [
              {
                name: 'Notifications',
                to: '/bo/profile/profile-notifications',
                icon: { name: 'ph:chat-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Customiser',
            icon: { name: 'ph:drop-half-bottom-duotone', class: 'w-5 h-5' },
            click: () => {
              const isSwitcherOpen = useState('switcher-open', () => false)
              isSwitcherOpen.value = true
            },
          },
        ],
      },
    },
    panels: [
      {
        name: 'language',
        position: 'right',
        component: 'DemoPanelLanguage',
      },
      {
        name: 'activity',
        position: 'right',
        component: 'DemoPanelActivity',
      },
      {
        name: 'search',
        position: 'left',
        component: 'DemoPanelSearch',
      },
      {
        name: 'task',
        position: 'right',
        component: 'DemoPanelTask',
      },
    ],
    error: {
      logo: {
        component: 'img',
        props: {
          src: '/img/illustrations/system/404-1.svg',
          class: 'relative z-20 w-full max-w-lg mx-auto',
        },
      },
    },
  },
})
