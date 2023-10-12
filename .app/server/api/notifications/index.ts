export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const slug = (query.slug as string) || ''
  const filter = (query.filter as string) || ''
  const action = (query.action as string) || 'get'

  const data = await getData()

  return {
    total: data.length,
    data: filterData(data, filter, page, perPage),
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
      return [item.date, item.time].some((item) => item.match(filterRe))
    })
    .slice(offset, offset + perPage)
}

async function getData() {
  return Promise.resolve([
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
    {
      id: 9,
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
    {
      id: 10,
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
    {
      id: 11,
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
    {
      id: 12,
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
  ])
}
