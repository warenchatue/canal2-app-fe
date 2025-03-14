import makeId from '~/server/utils'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const action = (query.action as string) || 'get'
  const id = (query.id as string) || ''
  const code = (query.code as string) || ''
  const token = (query.token as string) || ''

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
  } else if (action == 'findAllPaginate') {
    const response = await findAllPaginate(page, perPage, filter, token)
    return {
      stats: response.stats,
      metaData: response.results.metadata,
      data: response.results.data,
    }
  } else if (action == 'findAllLightByCode') {
    const data = await findAllLightByCode(code, token)
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
    }
  } else if (action == 'createOrder') {
    const body = await readBody(event)
    console.log(body)
    const data = await createOrder(body, token)
    return { data: data, success: true }
  } else if (action == 'copyOrder') {
    const data = await copyOrder(id, token)
    return { data: data, success: true }
  } else if (action == 'updateOrder') {
    const body = await readBody(event)
    const data = await updateOrder(id, body, token)
    return { data: data, success: true }
  } else if (action == 'delete') {
    const data = await deleteOrder(id, token)
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
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/orders/' + id, {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
  }).catch((error) => console.log(error))
  console.log(data)
  return Promise.resolve(data)
}

async function findAll(token: string) {
  console.log('findAll ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/orders', {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
  }).catch((error) => console.log(error))
  return Promise.resolve(data)
}

async function findAllPaginate(
  page: number,
  perPage: number,
  search: string,
  token: string,
) {
  console.log('findAllPaginate ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl +
      '/orders/paginate?page=' +
      page +
      '&perPage=' +
      perPage +
      '&search=' +
      search,
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

async function findAllLightByCode(code: string, token: string) {
  console.log('findAllLightByCode ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/orders/all/by/code?orderCode=' + code,
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

async function createOrder(body: any, token: string) {
  console.log('createOrder ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/orders', {
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
    body: {
      ...body,
      code: 'DEV' + '/' + new Date().getFullYear() + '/' + makeId(4),
    },
  }).catch((error) => console.log(error))
  console.log(data)
  return Promise.resolve(data)
}

async function copyOrder(id: string, token: string) {
  console.log('copyOrder ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/orders/' + id + '/copy',
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

async function updateOrder(id: string, body: any, token: string) {
  console.log('updateOrder ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/orders/' + id, {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
    body: body,
  }).catch((error) => console.log(error))
  console.log(data)
  return Promise.resolve(data)
}

async function deleteOrder(id: string, token: string) {
  console.log('deleteOrder ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/orders/' + id, {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
  }).catch((error) => console.log(error))
  console.log(data)
  return Promise.resolve(data)
}
