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
    const data = await getDIs()
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
    }
  } else if (action == 'post') {
    const body = await readBody(event)
    console.log(body)
    const data = await getDIs()

    const operations = data.filter(
      (d) => d.label == body.username && d.amount == body.password,
    )
    if (operations?.length == 1) {
      console.log('user found')
      return {
        data: operations[0],
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
      return [item.supplier.name, item.date, item.label].some((item) =>
        item.match(filterRe),
      )
    })
    .slice(offset, offset + perPage)
}

async function createDI() {}
async function getDIs() {
  return Promise.resolve([
    {
      id: '0',
      code: 'SGS-20865-23',
      start: '12/04/2022',
      end: '12/04/2022',
      pr: 'PR173722',
      status: 'active',
      amount: '50 000',
      currency: {
        name: 'EURO',
      },
      entity: {
        name: 'FIGEX',
      },
      supplier: {
        name: 'AXEL',
        email: 'axel@gmail.com',
        logo: '/img/avatars/company.svg',
      },
      bank: {
        name: 'AFB',
        email: 'axel@gmail.com',
        logo: '/img/avatars/company.svg',
      },
      obs: '',
    },
    {
      id: '1',
      code: 'SGS-20865-24',
      start: '19/04/2022',
      end: '25/04/2022',
      pr: 'PR173724',
      status: 'active',
      amount: '75 000',
      currency: {
        name: 'DOLLAR',
      },
       entity: {
        name: 'SOFOMEUTEX',
      },
      supplier: {
        name: 'AXEL',
        email: 'axel@gmail.com',
        logo: '/img/avatars/company.svg',
      },
      bank: {
        name: 'AFB',
        email: 'axel@gmail.com',
        logo: '/img/avatars/company.svg',
      },
      obs: '',
    },
    {
      id: '0',
      code: 'SGS-20865-23',
      start: '12/04/2022',
      end: '12/04/2022',
      pr: 'PR173722',
      status: 'active',
      amount: '50 000',
      currency: {
        name: 'EURO',
      },
      entity: {
        name: 'SOFOMEUTEX',
      },
      supplier: {
        name: 'AXEL',
        email: 'axel@gmail.com',
        logo: '/img/avatars/company.svg',
      },
      bank: {
        name: 'CBC',
        email: 'axel@gmail.com',
        logo: '/img/avatars/company.svg',
      },
      obs: '',
    },
  ])
}
async function updateDI() {}
