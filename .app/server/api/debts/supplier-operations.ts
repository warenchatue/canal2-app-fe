export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const action = (query.action as string) || 'get'
  const id = (query.id as string) || ''

  if (perPage >= 50) {
    // Create an artificial delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log(action)

  if (action == 'get') {
    const data = (await getSupplierOperations())[0]
    console.log(data)
    return {
      total: data.operations?.length,
      data: filterData(data.operations, filter, page, perPage),
      supplier: id ? data : undefined,
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
      return [item.date, item.label, item.amount].some((item) =>
        item.match(filterRe),
      )
    })
    .slice(offset, offset + perPage)
}

async function getSupplierOperations() {
  return Promise.resolve([
    {
      id: '0',
      name: 'AXEL',
      email: 'axel@gmail.com',
      description: '',
      logo: '/img/avatars/company.svg',
      operations: [
        {
          id: '0',
          date: '12/04/2022',
          label: 'FACT N°X07012',
          amount: '5 000',
          position: 'in',
          currency: {
            name: 'EURO',
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
          type: 'DEPOT',
          obs: '',
        },
        {
          id: '1',
          date: '12/04/2022',
          label: 'FACT N°1X7012',
          amount: '45 000',
          position: 'out',
          currency: {
            name: 'EURO',
          },
          supplier: {
            name: 'AXEL',
            email: 'axel@gmail.com',
            logo: '/img/avatars/company.svg',
          },
          bank: {
            name: 'UBA',
            email: 'axel@gmail.com',
            logo: '/img/avatars/company.svg',
          },
          type: 'VIREMENT',
          obs: '',
        },
      ],
    },
  ])
}
