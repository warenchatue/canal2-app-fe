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

  const data = await getProjects()

  return {
    total: data.length,
    data: filterData(data, filter, page, perPage),
    recent: data.filter((item) => item.recent === true),
    project: slug ? data.find((item) => item.slug === slug) : undefined,
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

async function getProjects() {
  return Promise.resolve([
    {
      id: '1',
      slug: 'test-project',
      name: 'Test Project',
      dueDate: 'August 2020',
      updated: '3m ago',
      image: '/img/apps/1.jpg',
      completed: 75,
      recent: false,
      category: 'UI/UX Design',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quid iudicant sensus? Primum quid tu dicis breve? Etiam beatissimum? Ne discipulum abducam, times.',
      meta: {
        monthDuration: 3,
        budgetType: 'Fixed',
      },
      owner: {
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
        files: [
          {
            id: 0,
            name: 'company-ux-guide.pdf',
            icon: '/img/icons/files/pdf.svg',
            size: '4.7MB',
            version: '1.5.2',
            uploaded: '2 weeks ago',
            author: {
              name: 'Hermann M.',
              picture: '/img/avatars/16.svg',
            },
          },
          {
            id: 1,
            name: 'tech-summit-expenses.xlsx',
            icon: '/img/icons/files/sheet.svg',
            size: '34KB',
            version: '1.1.3',
            uploaded: '3 days ago',
            author: {
              name: 'Clarissa M.',
              picture: '/img/avatars/5.svg',
            },
          },
          {
            id: 2,
            name: 'project-outline.docx',
            icon: '/img/icons/files/doc-2.svg',
            size: '77KB',
            version: '1.0.0',
            uploaded: '5 days ago',
            author: {
              name: 'Clark D.',
              picture: '/img/avatars/3.svg',
            },
          },
        ],
        tools: [
          {
            name: 'Sketch',
            description: 'Design Software',
            icon: '/img/stacks/sketch.svg',
          },
          {
            name: 'Illustrator',
            description: 'Design Software',
            icon: '/img/stacks/illustrator.svg',
          },
        ],
      },
    },
  ])
}
