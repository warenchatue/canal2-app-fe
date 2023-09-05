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
    const data = await getHours()
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
    }
  } else if (action == 'post') {
    const body = await readBody(event)
    console.log(body)
    const data = await getHours()

    const hours = data.filter(
      (d) => d.code == body.name && d.code == body.password,
    )
    if (hours?.length == 1) {
      console.log('Hours found')
      return {
        data: hours[0],
      }
    } else {
      console.log('Hours not found')
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
      return [item.name, item.code, item.type].some((item) =>
        item.match(filterRe),
      )
    })
    .slice(offset, offset + perPage)
}

async function createHour() {}
async function getHours() {
  return Promise.resolve([
    {
      id: '0',
      code: '7:25',
      name: '7H25',
      type: 'SPOT',
      status: 'active',
    },
    {
      id: '0',
      code: '8:25',
      name: '8H25',
      type: 'SPOT',
      status: 'active',
    },
    {
      id: '0',
      code: '9:25',
      name: '9H25',
      type: 'BA',
      status: 'active',
    },
    {
      id: '0',
      code: '10:25',
      name: '10H25',
      type: 'BA',
      status: 'active',
    },
    {
      id: '0',
      code: '11:25',
      name: '11H25',
      type: 'SPOT',
      status: 'active',
    },
  ])
}
async function updateHour() {}
