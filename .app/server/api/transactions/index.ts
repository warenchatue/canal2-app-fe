export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const action = (query.action as string) || 'get'
  const txnId = (query.txnId as string) || ''
  const token = (query.token as string) || ''
  const org = (query.org as string) || ''
  const team = (query.team as string) || ''
  const startDate = (query.startDate as string) || ''
  const endDate = (query.endDate as string) || ''

  if (action == 'findOne') {
    const data = await findOne(txnId, token)
    return { data: data, success: true }
  } else if (action == 'findAllFilters') {
    let data = await findAll(token)
    var startTime = new Date(new Date(startDate).toLocaleDateString()).getTime()
    var endTime = new Date(new Date(endDate).toLocaleDateString()).getTime()
    data = data.filter((e: any) => {
      var itemTime = new Date(
        new Date(e.createdAt).toLocaleDateString(),
      ).getTime()

      return (
        e.org._id == org &&
        // e.team == team &&
        itemTime >= startTime &&
        itemTime <= endTime
      )
    })

    return {
      data: filterData(data, filter, page, 1000),
      success: true,
    }
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
    return data
      .sort(function (a, b) {
        return a.code < b.code ? 1 : -1
      })
      .slice(offset, offset + perPage)
  }
  const filterRe = new RegExp(filter, 'i')
  return data
    .filter((item) => {
      console.log(item.amount)
      return [
        item.amount.toString(),
        `${item.author?.lastName}`,
        `${item.date}`,
      ].some((item) => item.match(filterRe))
    })
    .sort(function (a, b) {
      return a.code < b.code ? 1 : -1
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

async function getTxn(id: String) {
  return {}
}
