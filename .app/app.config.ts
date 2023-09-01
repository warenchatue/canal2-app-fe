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
    title: 'ERP SOFO',
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
            name: 'Dashboards',
            icon: { name: 'ph:sidebar-duotone', class: 'w-5 h-5' },
            activePath: '/dashboards',
            children: [
              {
                name: 'Principal',
                to: '/dashboards',
                icon: { name: 'ph:chart-pie-slice-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Analytique',
                to: '/dashboards/analytics',
                icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Tontine',
            icon: { name: 'ph:app-window-duotone', class: 'w-5 h-5' },
            activePath: '/bo/njangi',
            children: [
              {
                name: 'Tableau de bord',
                to: '/bo/njangi',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Tontines',
                to: '/bo/njangi/tontines',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Emprunts',
                to: '/bo/njangi/loans',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Déclaration DI',
            icon: { name: 'ph:app-window-duotone', class: 'w-5 h-5' },
            activePath: '/bo/di',
            children: [
              {
                name: 'Tableau de bord',
                to: '/bo/di',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'DI',
                to: '/bo/di/operations',
                icon: { name: 'ph:list-checks-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Entités',
                to: '/bo/di/entities',
                icon: { name: 'ph:list-checks-duotone', class: 'w-4 h-4' },
              },
            ],
          },

          {
            name: 'Dêtte',
            icon: { name: 'ph:app-window-duotone', class: 'w-5 h-5' },
            activePath: '/bo/debts',
            children: [
              {
                name: 'Tableau de bord',
                to: '/bo/debts',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Operations',
                to: '/bo/debts/operations',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Comptes Fournisseurs',
                to: '/bo/debts/supplier-accounts',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Estimation',
            icon: { name: 'ph:app-window-duotone', class: 'w-5 h-5' },
            activePath: '/bo/estimations',
            children: [
              {
                name: 'Tableau de bord',
                to: '/bo/estimations',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Operations',
                to: '/bo/estimations/operations',
                icon: { name: 'ph:list-checks-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Stock',
            icon: { name: 'ph:app-window-duotone', class: 'w-5 h-5' },
            activePath: '/bo/layouts/org',
            children: [
              {
                name: 'Tableau de bord',
                to: '/bo/stocks',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Produits',
                to: '/bo/stocks/products',
                icon: { name: 'ph:list-checks-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Admin',
            icon: { name: 'ph:nut-duotone', class: 'w-5 h-5' },
            isAdmin: true,
            activePath: '/bo/admin',
            children: [
              {
                name: 'Entités',
                to: '/bo/admin/entities',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Banques',
                to: '/bo/admin/banks',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Fournisseurs',
                to: '/bo/admin/suppliers',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
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
