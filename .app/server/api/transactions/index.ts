export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const action = (query.action as string) || 'get'
  const txnId = (query.txnId as string) || ''
  const token = (query.token as string) || ''
  const org = (query.org as string) || ''
  const id = (query.id as string) || ''
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
        (team.length > 1 ? e.data?.city == team : true) &&
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
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
      success: true,
    }
  } else if (action == 'updatePayment') {
    const body = await readBody(event)
    const data = await updatePayment(id, body, token)
    return { data: data, success: true }
  } else if (action == 'deleteWithInvoice') {
    const data = await deleteWithInvoice(id, token)
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
        `${item.announcer?.name}`,
        `${item.author?.lastName} ${item.author?.firstName}`,
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
  // console.log(data)

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

async function updatePayment(id: string, body: any, token: string) {
  const runtimeConfig = useRuntimeConfig()
  console.log('updatePayment, Token:' + token)
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/transactions/' + id,
    {
      method: 'PATCH',
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

async function getTxn(id: String) {
  return {}
}

async function deleteWithInvoice(id: string, token: string) {
  console.log('deleteTxn ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/transactions/' + id + '/with-invoice',
    {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
    },
  ).catch((error) => console.log(error))
  console.log(data)
  return Promise.resolve(data)
}
