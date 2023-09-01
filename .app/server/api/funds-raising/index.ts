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
    console.log('Get funds raising')
    const data = await getCampaigns()
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
      recent: data.filter((item) => item.recent === true),
      project: slug ? data.find((item) => item.slug === slug) : undefined,
    }
  } else if (action == 'getForOrg') {
    console.log('Get funds raising for org')
    const data = await getCampaigns()
    return {
      total: data.length,
      data: filterData(
        data.filter((item) => item.owner.slug === slug),
        filter,
        page,
        perPage,
      ),
      recent: data.filter((item) => item.recent === true),
      project: slug ? data.find((item) => item.slug === slug) : undefined,
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

async function getCampaigns() {
  return Promise.resolve([
    {
      id: '1',
      slug: 'construction-ecole-a-hiala',
      name: 'Constructon d`une école a hiala',
      category: 'Education',
      description:
        "L`objectif de ce projet vise à construire un établissement d'enseignement primaire à hiala  pour améliorer léduction de la population de cette localité.",
      status: 'active',
      dueDate: 'August 2024',
      updated: '3m ago',
      image:
        'https://cdn.helloasso.com/img/photos/collectes/plans%20en%203d%203%20-4fa70113e8c141c1ace77074ff291a54.jpg?resize=fill:500:360',
      completed: 75,
      recent: false,
      meta: {
        monthDuration: 8,
        budgetType: 'Fixed',
      },
      owner: {
        id: '1',
        name: 'Communauté Bandjoun',
        slug: 'bandjoun',
        description: 'La communauté bandjoun. Pour une évolution vers lavenir',
        owner: '1',
        members: ['1', '2'],
        type: 'NPO',
        medias: {
          cover:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cour_du_Palais_de_Bandjoun.jpg/1024px-Cour_du_Palais_de_Bandjoun.jpg',
          logo: 'https://image.jimcdn.com/app/cms/image/transf/none/path/s1084e755aa436055/image/ia9e3c984b2429c21/version/1600703023/image.jpg',
          badge: '/img/icons/flags/cmr.svg',
        },
      },
      files: [
        'https://cdn.helloasso.com/img/photos/collectes/plans%20en%203d%203%20-4fa70113e8c141c1ace77074ff291a54.jpg?resize=fill:500:360',
        'https://cdn.helloasso.com/img/photos/collectes/plans%20en%203d%203%20-4fa70113e8c141c1ace77074ff291a54.jpg?resize=fill:500:360',
        'https://cdn.helloasso.com/img/photos/collectes/plans%20en%203d%203%20-4fa70113e8c141c1ace77074ff291a54.jpg?resize=fill:500:360',
        'https://cdn.helloasso.com/img/photos/collectes/plans%20en%203d%203%20-4fa70113e8c141c1ace77074ff291a54.jpg?resize=fill:500:360',
      ],
      contributors: [
        {
          id: 27,
          src: '/img/avatars/24.svg',
          badge: '/img/stacks/illustrator.svg',
          name: 'CHATUE Emmanuel',
          tooltip: 'Carmen E.',
          'data-tooltip': 'Carmen E.',
          text: 'CE',
          amount: '500 000 XAF',
          date: '18-04-2023',
          txn: {},
        },
        {
          id: 15,
          src: '/img/avatars/15.svg',
          badge: '/img/stacks/js.svg',
          name: 'ANAFACK Jordan',
          tooltip: 'Josh C.',
          'data-tooltip': 'Josh C.',
          text: 'JC',
          amount: '25 000 XAF',
          date: '20-03-2022',
          txn: {},
        },
        {
          id: 12,
          src: '/img/avatars/12.svg',
          badge: '/img/stacks/csharp.svg',
          name: 'Anonyme',
          tooltip: 'Marjory L.',
          'data-tooltip': 'Marjory L.',
          text: 'ML',
          amount: '5000 XAF',
          date: '10-04-2022',
          txn: {},
        },
      ],
      tools: [
        {
          name: 'whatsapp',
          description: 'Design Software',
          icon: '/img/stacks/sketch.svg',
        },
        {
          name: 'facebook',
          description: 'Design Software',
          icon: '/img/stacks/sketch.svg',
        },
        {
          name: 'twitter',
          description: 'Design Software',
          icon: '/img/stacks/sketch.svg',
        },
      ],
    },
  ])
}
