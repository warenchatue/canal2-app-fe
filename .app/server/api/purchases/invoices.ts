import makeId from '~/server/utils'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const action = (query.action as string) || 'get'
  const id = (query.id as string) || ''
  const token = (query.token as string) || ''
  const org = (query.org as string) || ''
  const team = (query.team as string) || ''
  const startDate = (query.startDate as string) || ''
  const endDate = (query.endDate as string) || ''

  if (action == 'findOne') {
    const data = await findOne(id, token)
    return { data: data, success: true }
  } else if (action == 'findAll') {
    const response = await findAll(token)
    return {
      total: response.metaData.totalItems,
      metaData: response.metaData,
      data: filterData(response.data, filter, page, perPage),
    }
  } else if (action == 'findAllFilters') {
    const response = await findAll(token)
    var startTime = new Date(new Date(startDate).toLocaleDateString()).getTime()
    var endTime = new Date(new Date(endDate).toLocaleDateString()).getTime()
    response.data = response.data.filter((e: any) => {
      var itemTime = new Date(new Date(e.date).toLocaleDateString()).getTime()

      return (
        e.org._id == org &&
        (team.length > 1 ? e.team == team : true) &&
        itemTime >= startTime &&
        itemTime <= endTime
      )
    })

    return {
      total: response.metaData.totalItems,
      metaData: response.metaData,
      data: filterData(response.data, filter, page, 1000),
    }
  } else if (action == 'findAllUnpaid') {
    const response = await findAll(token)
    response.data = response.data.filter((e: any) => {
      return (e.amount - e.paid ?? 0) > 0 && e.taxes.length == 0
    })
    let totalSelection = 0
    for (let index = 0; index < response.data.length; index++) {
      totalSelection += response.data[index].amount - response.data[index].paid
    }
    response.metaData.totalSelection = totalSelection

    return {
      total: response.data.length,
      metaData: response.metaData,
      data: filterData(response.data, filter, page, perPage),
    }
  } else if (action == 'findAllUnpaidFilters') {
    const response = await findAll(token)
    var startTime = new Date(new Date(startDate).toLocaleDateString()).getTime()
    var endTime = new Date(new Date(endDate).toLocaleDateString()).getTime()
    response.data = response.data.filter((e: any) => {
      var itemTime = new Date(new Date(e.date).toLocaleDateString()).getTime()

      return (
        e.org._id == org &&
        (team.length > 1 ? e.team == team : true) &&
        itemTime >= startTime &&
        itemTime <= endTime
      )
    })
    response.data = response.data.filter((e: any) => {
      return (e.amount - e.paid ?? 0) > 0 && e.taxes.length == 0
    })
    let totalSelection = 0
    for (let index = 0; index < response.data.length; index++) {
      totalSelection += response.data[index].amount - response.data[index].paid
    }
    response.metaData.totalSelection = totalSelection

    return {
      total: response.metaData.totalItems,
      metaData: response.metaData,
      data: filterData(response.data, filter, page, 1000),
    }
  } else if (action == 'createInvoice') {
    const body = await readBody(event)
    console.log(body)
    const data = await createInvoice(body, token)
    return { data: data, success: true }
  } else if (action == 'updateInvoice') {
    const body = await readBody(event)
    const data = await updateInvoice(id, body, token)
    return { data: data, success: true }
  } else if (action == 'addInvoicePayment') {
    const body = await readBody(event)
    const data = await addInvoicePayment(id, body, token)
    return { data: data, success: true }
  } else if (action == 'addInvoiceTaxes') {
    const body = await readBody(event)
    const data = await addInvoiceTaxes(id, body, token)
    return { data: data, success: true }
  } else if (action == 'copyInvoice') {
    const data = await copyInvoice(id, token)
    return { data: data, success: true }
  } else if (action == 'updateInvoiceIsDoit') {
    const data = await updateInvoiceIsDoit(id, token)
    return { data: data, success: true }
  } else if (action == 'delete') {
    const data = await deleteInvoice(id, token)
    return { data: data, success: true }
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
      return [
        item.code ?? '',
        item.org?.name ?? '',
        item.announcer?.name ?? '',
        item.team ?? '',
      ].some((item) => item.match(filterRe))
    })
    .sort(function (a, b) {
      return a.code < b.code ? 1 : -1
    })
    .slice(offset, offset + perPage)
}

async function findOne(id: string, token: string) {
  console.log('findOne ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/purchase-invoices/' + id,
    {
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
    },
  ).catch((error) => console.log(error))
  // console.log(data)
  return Promise.resolve(data)
}

async function findAll(token: string) {
  console.log('findAll ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/purchase-invoices',
    {
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
    },
  ).catch((error) => console.log(error))
  return Promise.resolve(data)
}

async function createInvoice(body: any, token: string) {
  console.log('createInvoice ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/purchase-invoices',
    {
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
      body: {
        ...body,
        code: 'FACT' + '/' + new Date().getFullYear() + '/' + makeId(4),
      },
    },
  ).catch((error) => console.log(error))
  console.log(data)
  return Promise.resolve(data)
}

async function updateInvoice(id: string, body: any, token: string) {
  console.log('updateInvoice ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/purchase-invoices/' + id,
    {
      method: 'PUT',
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

async function addInvoicePayment(id: string, body: any, token: string) {
  console.log('addInvoicePayment ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/purchase-invoices/' + id + '/addPayment',
    {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
      body: body,
    },
  ).catch((error) => console.log(error))
  // console.log(data)
  return Promise.resolve(data)
}

async function addInvoiceTaxes(id: string, body: any, token: string) {
  console.log('addInvoiceTaxes ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/purchase-invoices/' + id + '/addTax',
    {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
      body: body,
    },
  ).catch((error) => console.log(error))
  // console.log(data)
  return Promise.resolve(data)
}

async function copyInvoice(id: string, token: string) {
  console.log('copyInvoice ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/purchase-invoices/' + id + '/copy',
    {
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
    },
  ).catch((error) => console.log(error))
  console.log(data)
  return Promise.resolve(data)
}

async function updateInvoiceIsDoit(id: string, token: string) {
  console.log('updateInvoiceIsDoit ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/purchase-invoices/' + id + '/doit',
    {
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
    },
  ).catch((error) => console.log(error))
  console.log(data)
  return Promise.resolve(data)
}

async function deleteInvoice(id: string, token: string) {
  console.log('deleteInvoice ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/purchase-invoices/' + id,
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
