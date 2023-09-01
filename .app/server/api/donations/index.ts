export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const slug = (query.slug as string) || ''
  const action = (query.action as string) || 'get'

  if (perPage >= 50) {
    // Create an artificial delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  if (action == 'get') {
    console.log('Get donations')
    const data = await getDonations()
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
      recent: data.filter((item) => item.recent === true),
      donation: slug ? data.find((item) => item.id === slug) : undefined,
    }
  } else if (action == 'getForOrg') {
    console.log('Get donations for org')
    const data = await getDonations()
    return {
      total: data.length,
      data: filterData(
        data.filter((item) => item.org.slug === slug),
        filter,
        page,
        perPage,
      ),
      recent: data.filter((item) => item.recent === true),
      donation: slug ? data.find((item) => item.id === slug) : undefined,
    }
  }
})

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
      return [item.name, item.owner.name, item.category].some((item) =>
        item.match(filterRe),
      )
    })
    .slice(offset, offset + perPage)
}

async function getDonations() {
  return Promise.resolve([
    {
      id: '1',
      description: 'Don Project',
      status: 'success',
      org: {
        id: '1',
        name: 'Communauté Bandjoun',
        slug: 'bandjoun',
        description: 'La communauté bandjoun',
        owner: '1',
        members: ['1', '2'],
        type: 'NPO',
        medias: {
          cover: '/img/avatars/5.svg',
          logo: '/img/icons/flags/united-states-of-america.svg',
        },
      },
      dueDate: 'August 2020',
      updated: '3m ago',
      recent: false,
      category: 'UI/UX Design',
      amount: '10 000 XAF',
      txn: {},
      customer: {
        id: '1',
        name: 'Jordan',
        email: 'anafackjordan@gmail.com',
        role: 'member',
        medias: {
          avatar: '/img/avatars/5.svg',
          flag: '/img/icons/flags/united-states-of-america.svg',
        },
      },
    },
    {
      id: '2',
      description: 'Don Project 2',
      status: 'pending',
      org: {
        id: '1',
        name: 'Communauté Bandjoun',
        slug: 'bandjoun',
        description: 'La communauté bandjoun',
        owner: '1',
        members: ['1', '2'],
        type: 'NPO',
        medias: {
          cover: '/img/avatars/5.svg',
          logo: '/img/icons/flags/united-states-of-america.svg',
        },
      },
      dueDate: 'August 2020',
      updated: '3m ago',
      recent: true,
      category: 'UI/UX Design',
      amount: '20 000 XAF',
      txn: {},
      customer: {
        id: '1',
        name: 'Jordan',
        email: 'anafackjordan@gmail.com',
        role: 'member',
        medias: {
          avatar: '/img/avatars/5.svg',
          flag: '/img/icons/flags/united-states-of-america.svg',
        },
      },
    },
  ])
}
