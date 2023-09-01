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
    const data = await getOperations()
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
    }
  } else if (action == 'post') {
    const body = await readBody(event)
    console.log(body)
    const data = await getOperations()

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

async function createUser() {}
async function getOperations() {
  return Promise.resolve([
    {
      id: '0',
      date: '12/04/2022',
      label: 'FACT N°X07012',
      amount: '5 000',
      position: 'in',
      currency: {
        name: 'XAF',
      },
      supplier: {
        name: 'AXEL',
        email: 'axel@gmail.com',
        logo: '/img/avatars/company.svg',
      },
      bank: {
        name: 'AFB',
        email: 'axel@gmail.com',
        logo: '/img/avatars/5.svg',
      },
      type: 'DEPOT',
      obs: '',
    },
    {
      id: '1',
      date: '19/05/2022',
      label: 'FACT N°A07010',
      position: 'out',
      amount: '72 000',
      currency: {
        name: 'DOLLAR',
      },
      supplier: {
        name: 'Jordan',
        email: 'michel@gmail.com',
        logo: '/img/avatars/company.svg',
      },
      bank: {
        name: 'CBC',
      },
      type: 'DEPOT',
      obs: '',
    },
    {
      id: '2',
      date: '25/05/2022',
      label: 'FACT N°X07012',
      amount: '5000',
      position: 'in',
      currency: {
        name: 'EURO',
      },
      supplier: {
        name: 'Michel',
        email: 'michel@gmail.com',
        logo: '/img/avatars/company.svg',
      },
      bank: {
        name: 'MUPECI',
      },
      type: 'VIREMENT',
      obs: '',
    },
  ])
}
async function updateOperation() {}
