export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const action = (query.action as string) || 'get'
  const txnId = (query.txnId as string) || ''
  const orgId = (query.orgId as string) || ''
  const token = (query.token as string) || ''

  if (action == 'findOne') {
    const data = await findOne(txnId, token)
    return { data: data, success: true }
  } else if (action == 'findAll') {
    const data = await findAll(token)
    return { data: filterData(data, filter, page, perPage), success: true }
  } else if (action == 'createSimpleDonation') {
    const body = await readBody(event)
    const data = await createSimpleDonation(token, body)
    return { data: data, success: true }
  } else if (action == 'addPaymentMethod') {
    const body = await readBody(event)
    const data = await addPaymentMethod(txnId, body, token)
    return { data: data, success: true }
  } else if (action == 'addExternalTxn') {
    const body = await readBody(event)
    const data = await addExternalTxn(txnId, body, token)
    return { data: data, success: true }
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
      console.log(item.amount)
      return [
        item.amount.toString(),
        `${item.data?.donor?.lastName}`,
        `${item.data?.donor?.email}`,
      ].some((item) => item.match(filterRe))
    })
    .slice(offset, offset + perPage)
}

async function findOne(txnId: string, token: string) {
  const runtimeConfig = useRuntimeConfig()
  console.log('findOne, Token:' + token)
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/transactions/' + txnId,
    {
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
    },
  ).catch((error) => console.log(error))
  console.log(data)

  return Promise.resolve(data)
}

async function findAll(token: string) {
  const runtimeConfig = useRuntimeConfig()
  console.log('findAll, Token:' + token)
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/transactions', {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
  }).catch((error) => console.log(error))
  console.log(data)

  return Promise.resolve(data)
}

async function createSimpleDonation(token: string, body: any) {
  const runtimeConfig = useRuntimeConfig()
  console.log('createSimpleDonation, Token:' + token)
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/transactions/guest',
    {
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
      body: body,
    },
  ).catch((error) => console.log(error))
  console.log(data)

  return Promise.resolve(data)
}

async function addPaymentMethod(txnId: string, body: any, token: string) {
  const runtimeConfig = useRuntimeConfig()
  console.log('addPaymentMethod, Token:' + token)
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/transactions/paymentMethod/' + txnId,
    {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
      body: { paymentMethod: body },
    },
  ).catch((error) => console.log(error))
  console.log(data)

  return Promise.resolve(data)
}

async function addExternalTxn(txnId: string, body: any, token: string) {
  const runtimeConfig = useRuntimeConfig()
  console.log('addExternalTxn, Token:' + token)
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/transactions/externalTxn/' + txnId,
    {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
      body: { _txn: body },
    },
  ).catch((error) => console.log(error))
  console.log(data)

  return Promise.resolve(data)
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
  ])
}
async function getTxn(id: String) {
  return {}
}
