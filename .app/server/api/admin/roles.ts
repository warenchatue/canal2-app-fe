export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const action = (query.action as string ) || 'get'

  if (perPage >= 50) {
    // Create an artificial delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  if(action == 'get'){

    const data = await getRoles()

    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
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
      return [item.name, item.slug].some((item) =>
        item.match(filterRe),
      )
    })
    .slice(offset, offset + perPage)
}

async function getRoles() {
  return Promise.resolve([
    {
      id: '1',
      name: 'Admin',
      slug: 'admin',
      medias: {
        avatar: '/img/avatars/5.svg',
      },
    },
    {
      id: '2',
      name: 'Member',
      slug: 'member',
      medias: {
        avatar: '/img/avatars/5.svg',
      },
    },
  ])
}