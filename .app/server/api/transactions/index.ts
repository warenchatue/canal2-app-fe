export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const action = (query.action as string) || 'get'
  const txnId = (query.txnId as string) || ''

  if (perPage >= 50) {
    // Create an artificial delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  if (action == 'get') {
    const data = await getTxns()

    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
    }
  } else if (action == 'details') {
    const data = await getTxn(txnId)

    return {
      data,
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
      return [item.firstName, item.lastName, item.email].some((item) =>
        item.match(filterRe),
      )
    })
    .slice(offset, offset + perPage)
}

async function getTxns() {
  return Promise.resolve([
    {
      id: '1',
      amount: '5000',
      currency: 'XAF',
      operator: {
        name: 'Mobile Money',
        slug: 'MOMO',
        medias: {
          avatar: '/img/avatars/5.svg',
          flag: '/img/icons/flags/united-states-of-america.svg',
        },
      },
      type: {
        name: 'donation',
        id: '1',
      },
      author: {
        id: '1',
        name: 'Jordan',
        email: 'anafackjordan@gmail.com',
        role: 'member',
        medias: {
          avatar: '/img/avatars/5.svg',
          flag: '/img/icons/flags/united-states-of-america.svg',
        },
      },
      createdAt: '2021-05-02',
      updatedAt: '2021-05-02',
    },
    {
      id: '2',
      amount: '50000',
      currency: 'XAF',
      operator: {
        name: 'Orange Money',
        slug: 'OM',
        medias: {
          avatar: '/img/avatars/4.svg',
          flag: '/img/icons/flags/united-states-of-america.svg',
        },
      },
      type: {
        name: 'donation',
        id: '1',
      },
      author: {
        id: '1',
        name: 'Jordan',
        email: 'anafackjordan@gmail.com',
        role: 'member',
        medias: {
          avatar: '/img/avatars/5.svg',
          flag: '/img/icons/flags/united-states-of-america.svg',
        },
      },
      createdAt: '2022-05-02',
      updatedAt: '2022-05-02',
    },
  ])
}
async function getTxn(id: String) {
  return {}
}
