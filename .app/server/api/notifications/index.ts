export default defineEventHandler(async () => {
  const data = await getData()

  return data
})

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
  ])
}
