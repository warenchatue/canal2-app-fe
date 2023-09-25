export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const slug = (query.slug as string) || ''
  const filter = (query.filter as string) || ''
  const action = (query.action as string) || 'get'

  console.log('Org api')

  if (perPage >= 50) {
    // Create an artificial delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  if (action == 'get') {
    const data = await getOrgs()
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
      org: slug ? data.find((item) => item.slug === slug) : undefined,
    }
  } else if (action == 'getUserOrgs') {
    const body = await readBody(event)
    console.log(body)
    const data = await getOrgs()
    return {
      total: data.length,
      data: filterDataByMember(data, body.uid),
    }
  }
})

function filterDataByMember(data: any[], uid: string) {
  return data.filter((item) => {
    return [item.owner.id, ...item.members.map((m) => m.id)].some((item) =>
      item.match(uid),
    )
  })
}

function filterData(
  data: any[],
  filter: string,
  page: number,
  perPage: number,
) {
  const offset = (page - 1) * perPage
  if (!filter) {
    return data.slice(offset, offset + perPage)
  }
  const filterRe = new RegExp(filter, 'i')
  return data
    .filter((item) => {
      return [item.name, item.description, item.type].some((item) =>
        item.match(filterRe),
      )
    })
    .slice(offset, offset + perPage)
}

async function createOrg() {}
async function getOrgs() {
  return Promise.resolve([
    {
      id: '1',
      name: 'Canal2 International',
      slug: 'bandjoun',
      description: 'Toujour plus près de vous',
      email: 'c2@gmail.com',
      status: 'active',
      owner: {
        id: '1',
        firstName: 'Jordan',
        lastName: 'ANAFACK',
        email: 'anafackjordan@gmail.com',
        status: 'active',
        token: 'xa',
        password: 'test',
        role: 'member',
        medias: {
          avatar: '/img/avatars/5.svg',
          flag: '/img/icons/flags/united-states-of-america.svg',
        },
        notifications: [],
      },
      members: [
        {
          id: '1',
          firstName: 'Jordan',
          lastName: 'ANAFACK',
          email: 'anafackjordan@gmail.com',
          status: 'active',
          token: 'xa',
          password: 'test',
          role: 'member',
          medias: {
            avatar: '/img/avatars/5.svg',
            flag: '/img/icons/flags/united-states-of-america.svg',
          },
          notifications: [],
        },
        {
          id: '2',
          firstName: 'Diderot',
          lastName: 'AR.',
          email: 'jordananafack@gmail.com',
          status: 'active',
          token: 'xb',
          password: 'test2',
          role: 'member',
          medias: {
            avatar: '/img/avatars/4.svg',
            flag: '/img/icons/flags/united-states-of-america.svg',
          },
        },
      ],
      type: 'NPO',
      medias: {
        cover:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cour_du_Palais_de_Bandjoun.jpg/1024px-Cour_du_Palais_de_Bandjoun.jpg',
        logo: 'https://image.jimcdn.com/app/cms/image/transf/none/path/s1084e755aa436055/image/ia9e3c984b2429c21/version/1600703023/image.jpg',
        badge: '/img/icons/flags/cmr.svg',
      },
      socials: [
        {
          name: 'facebook',
          url: 'https://facebook.com',
          icon: 'fa6-brands:facebook-f',
        },
        {
          name: 'twitter',
          url: 'https://twitter.com',
          icon: 'fa6-brands:twitter',
        },
        {
          name: 'linkedin',
          url: 'https://linkedin.com',
          icon: 'fa6-brands:linkedin-in',
        },
      ],
      notifications: [
        {
          id: 1,
          user: {
            name: 'Melany L.',
            src: '/img/avatars/25.svg',
            text: 'ML',
          },
          date: 'Mar 2, 2023',
          time: '11:28 am',
          status: 0,
          target: {
            type: 'project',
            name: 'Delivery App',
            url: '/layouts/projects/details/delivery-app-project',
            text: 'made some changes to the',
          },
          people: [
            {
              name: 'Maya R.',
              src: '/img/avatars/2.svg',
              text: 'MR',
            },
          ],
        },
        {
          id: 2,
          user: {
            name: 'Kendra W.',
            src: '/img/avatars/10.svg',
            text: 'KW',
          },
          date: 'Feb 28, 2023',
          time: '2:14 pm',
          status: 0,
          target: {
            type: 'project',
            name: 'Delivery App',
            url: '/layouts/projects/details/delivery-app-project',
            text: 'left a comment on a task, in the',
          },
          people: [
            {
              name: 'Greta K.',
              src: '/img/avatars/24.svg',
              text: 'GK',
            },
          ],
        },
        {
          id: 3,
          user: {
            name: 'Howard C.',
            src: '/img/avatars/20.svg',
            text: 'HC',
          },
          date: 'Feb 25, 2023',
          time: '11:27 am',
          status: 0,
          target: {
            type: 'project',
            name: 'Delivery App',
            url: '/layouts/projects/details/delivery-app-project',
            text: 'left a comment on a task, in the',
          },
          people: [
            {
              name: 'Sandra W.',
              src: '/img/avatars/12.svg',
              text: 'SW',
            },
          ],
        },
      ],
    },
    {
      id: '2',
      name: 'Sweet FM',
      slug: 'baham',
      description: 'Le bonheur c`est ici',
      email: 'sweet@gmail.com',
      status: 'active',
      owner: {
        id: '2',
        firstName: 'Diderot',
        lastName: 'AR.',
        email: 'jordananafack@gmail.com',
        status: 'active',
        token: 'xb',
        password: 'test2',
        role: 'member',
        medias: {
          avatar: '/img/avatars/4.svg',
          flag: '/img/icons/flags/united-states-of-america.svg',
        },
      },
      members: [
        {
          id: '1',
          firstName: 'Jordan',
          lastName: 'ANAFACK',
          email: 'anafackjordan@gmail.com',
          status: 'active',
          token: 'xa',
          password: 'test',
          role: 'member',
          medias: {
            avatar: '/img/avatars/5.svg',
            flag: '/img/icons/flags/united-states-of-america.svg',
          },
          notifications: [],
        },
        {
          id: '2',
          firstName: 'Diderot',
          lastName: 'AR.',
          email: 'jordananafack@gmail.com',
          status: 'active',
          token: 'xb',
          password: 'test2',
          role: 'member',
          medias: {
            avatar: '/img/avatars/4.svg',
            flag: '/img/icons/flags/united-states-of-america.svg',
          },
        },
      ],
      type: 'NPO',
      medias: {
        cover: '/img/avatars/5.svg',
        logo: '/img/icons/flags/united-states-of-america.svg',
        badge: '/img/icons/flags/united-states-of-america.svg',
      },
      socials: [
        {
          name: 'facebook',
          url: 'https://facebook.com',
          icon: 'fa6-brands:facebook-f',
        },
        {
          name: 'twitter',
          url: 'https://twitter.com',
          icon: 'fa6-brands:twitter',
        },
        {
          name: 'linkedin',
          url: 'https://linkedin.com',
          icon: 'fa6-brands:linkedin-in',
        },
      ],
      notifications: [
        {
          id: 1,
          user: {
            name: 'Melany L.',
            src: '/img/avatars/25.svg',
            text: 'ML',
          },
          date: 'Mar 2, 2023',
          time: '11:28 am',
          status: 0,
          target: {
            type: 'project',
            name: 'Delivery App',
            url: '/layouts/projects/details/delivery-app-project',
            text: 'made some changes to the',
          },
          people: [
            {
              name: 'Maya R.',
              src: '/img/avatars/2.svg',
              text: 'MR',
            },
          ],
        },
        {
          id: 2,
          user: {
            name: 'Kendra W.',
            src: '/img/avatars/10.svg',
            text: 'KW',
          },
          date: 'Feb 28, 2023',
          time: '2:14 pm',
          status: 0,
          target: {
            type: 'project',
            name: 'Delivery App',
            url: '/layouts/projects/details/delivery-app-project',
            text: 'left a comment on a task, in the',
          },
          people: [
            {
              name: 'Greta K.',
              src: '/img/avatars/24.svg',
              text: 'GK',
            },
          ],
        },
        {
          id: 3,
          user: {
            name: 'Howard C.',
            src: '/img/avatars/20.svg',
            text: 'HC',
          },
          date: 'Feb 25, 2023',
          time: '11:27 am',
          status: 0,
          target: {
            type: 'project',
            name: 'Delivery App',
            url: '/layouts/projects/details/delivery-app-project',
            text: 'left a comment on a task, in the',
          },
          people: [
            {
              name: 'Sandra W.',
              src: '/img/avatars/12.svg',
              text: 'SW',
            },
          ],
        },
        {
          id: 8,
          user: {
            name: 'John B.',
            src: '/img/avatars/8.svg',
            text: 'JB',
          },
          date: 'Feb 25, 2023',
          time: '3:19 pm',
          status: 1,
          target: {
            type: 'project',
            name: 'Delivery App',
            url: '/layouts/projects/details/delivery-app-project',
            text: 'Changed the status of a task, in the',
          },
          people: [],
        },
      ],
    },
  ])
}
async function updateOrg() {}
