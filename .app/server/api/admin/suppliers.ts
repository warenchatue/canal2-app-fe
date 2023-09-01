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
    const data = await getSuppliers()
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
    }
  } else if (action == 'post') {
    const body = await readBody(event)
    console.log(body)
    const data = await getSuppliers()

    const suppliers = data.filter(
      (d) => d.email == body.name && d.email == body.password,
    )
    if (suppliers?.length == 1) {
      console.log('user found')
      return {
        data: suppliers[0],
      }
    } else {
      console.log('user not found')
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

async function createSupplier() {}
async function getSuppliers() {
  return Promise.resolve([
    {
      id: '0',
      name: 'AXEL',
      email: 'axel@gmail.com',
      logo: '/img/avatars/company.svg',
      status: 'active',
    },
    {
      id: '1',
      name: 'Jordan',
      email: 'michel@gmail.com',
      logo: '/img/avatars/company.svg',
      status: 'active',
    },
    {
      id: '2',
      name: 'Michel',
      email: 'michel@gmail.com',
      logo: '/img/avatars/company.svg',
      status: 'active',
    },
  ])
}
async function updateSupplier() {}
