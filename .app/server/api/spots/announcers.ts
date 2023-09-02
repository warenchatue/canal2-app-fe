export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const action = (query.action as string) || 'get'

  if (perPage >= 50) {
    // Create an artificial delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log(action)

  if (action == 'get') {
    const data = await getAnnouncers()
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
    }
  } else if (action == 'post') {
    const body = await readBody(event)
    console.log(body)
    const data = await getAnnouncers()

    const Announcers = data.filter(
      (d) => d.email == body.name && d.email == body.password,
    )
    if (Announcers?.length == 1) {
      console.log('Announcer found')
      return {
        data: Announcers[0],
      }
    } else {
      console.log('Announcer not found')
      return {
        data: null,
      }
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
      return [item.name, item.email, item.status].some((item) =>
        item.match(filterRe),
      )
    })
    .slice(offset, offset + perPage)
}

async function createAnnouncer() {}
async function getAnnouncers() {
  return Promise.resolve([
    {
      id: '0',
      name: 'Canal2 International',
      email: 'info@cana2international.net',
      logo: '/img/avatars/company.svg',
      status: 'active',
    },
    {
      id: '1',
      name: 'IUG',
      email: 'info@iug.com',
      logo: '/img/avatars/company.svg',
      status: 'active',
    },
    {
      id: '2',
      name: 'IUC',
      email: 'info@myiuc.com',
      logo: '/img/avatars/company.svg',
      status: 'active',
    },
  ])
}
async function updateAnnouncer() {}
