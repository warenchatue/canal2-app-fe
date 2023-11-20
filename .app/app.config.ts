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
    title: 'C2PUB',
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
            name: 'Pub',
            icon: { name: 'ph:target-duotone', class: 'w-5 h-5' },
            activePath: '/bo/pub',
            children: [
              {
                name: 'Tableau de bord',
                to: '/bo/pub',
                icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Planning de diffusion',
                to: '/bo/pub/diffusion-list',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Packages',
                to: '/bo/pub/orders',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Horaires',
                to: '/bo/pub/hours',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Ventes',
            icon: { name: 'ph:target-duotone', class: 'w-5 h-5' },
            activePath: '/bo/sales',
            children: [
              {
                name: 'Tableau de bord',
                to: '/bo/sales',
                icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Raports',
                to: '/bo/sales/reports',
                icon: { name: 'lucide:file', class: 'w-4 h-4' },
              },
              {
                name: 'Devis',
                to: '/bo/sales/orders',
                icon: { name: 'lucide:file', class: 'w-4 h-4' },
              },
              {
                name: 'Factures',
                to: '/bo/sales/invoices',
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
                name: "Variante d'articles",
                to: '/bo/sales/articles-categories',
                icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
              },
            ],
          },
          {
            name: 'Finances',
            icon: { name: 'ph:money-duotone', class: 'w-5 h-5' },
            activePath: '/bo/accountancy',
            children: [
              {
                name: 'Tableau de bord',
                to: '/bo/accountancy',
                icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Reductions',
                to: '/bo/accountancy/reports',
                icon: { name: 'lucide:file', class: 'w-4 h-4' },
              },
              {
                name: 'Taxes',
                to: '/bo/accountancy/orders',
                icon: { name: 'lucide:file', class: 'w-4 h-4' },
              },
              {
                name: 'Comptes',
                to: '/bo/accountancy/orders',
                icon: { name: 'lucide:file', class: 'w-4 h-4' },
              },
            ],
          },

          // {
          //   name: 'Emissions',
          //   icon: { name: 'ph:app-window-duotone', class: 'w-5 h-5' },
          //   activePath: '/bo/estimations',
          //   children: [
          //     {
          //       name: 'Tableau de bord',
          //       to: '/bo/estimations',
          //       icon: { name: 'ph:list-bullets-duotone', class: 'w-4 h-4' },
          //     },
          //     {
          //       name: 'Liste de diffusion',
          //       to: '/bo/estimations/operations',
          //       icon: { name: 'ph:list-checks-duotone', class: 'w-4 h-4' },
          //     },
          //     {
          //       name: 'Planing de diffusion',
          //       to: '/bo/estimations/operations',
          //       icon: { name: 'ph:list-checks-duotone', class: 'w-4 h-4' },
          //     },
          //     {
          //       name: 'Horaires',
          //       to: '/bo/estimations/operations',
          //       icon: { name: 'ph:list-checks-duotone', class: 'w-4 h-4' },
          //     },
          //   ],
          // },

          {
            name: 'Messagerie',
            icon: { name: 'ph:chat-duotone', class: 'w-5 h-5' },
            isAdmin: true,
            activePath: '/bo/sav',
            children: [
              {
                name: 'Tableau de bord',
                to: '/bo/pub',
                icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Rappels',
                to: '/bo/pub/reports',
                icon: { name: 'ph:chat-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Conversations',
                to: '/bo/pub/reports',
                icon: { name: 'ph:chat-duotone', class: 'w-4 h-4' },
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
                name: 'Entreprises',
                to: '/bo/admin/users',
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
            name: 'Profile',
            icon: { name: 'ph:user-duotone', class: 'w-5 h-5' },
            activePath: '/bo/profile',
            children: [
              {
                name: 'Notifications',
                to: '/bo/profile/profile-notifications',
                icon: { name: 'ph:chat-duotone', class: 'w-4 h-4' },
              },
              // {
              //   name: 'Taches',
              //   to: '/bo/profile/tasks',
              //   icon: { name: 'ph:chat-duotone', class: 'w-4 h-4' },
              // },
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
