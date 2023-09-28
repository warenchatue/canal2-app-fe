export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const action = (query.action as string) || 'get'
  const id = (query.id as string) || ''
  const packageId = (query.packageId as string) || ''
  const token = (query.token as string) || ''
  const key = (query.key as string) || ''

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
  } else if (action == 'findAllStats') {
    const response = await findAllStats(token)
    return {
      total: response.metaData.totalItems,
      metaData: response.metaData,
      data: filterData(response.data, filter, page, perPage),
    }
  } else if (action == 'createPlanning') {
    const body = await readBody(event)
    console.log(body)
    const data = await createPlanning(packageId, body, token)
    return { data: data, success: true }
  } else if (action == 'updatePlanning') {
    const body = await readBody(event)
    console.log(body)
    const data = await updatePlanning(id, body, token)
    return { data: data, success: true }
  } else if (action == 'delete') {
    const data = await deletePlanning(id, token)
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
    data.slice(offset, offset + perPage)
  }
  const filterRe = new RegExp(filter, 'i')
  const filteredData = data.filter((item) => {
    return [
      new Date(item.date).toDateString(),
      item.spot?.product,
      item.spot?.package?.announcer?.name,
    ].some((item) => item.match(filterRe))
  })

  return filteredData.slice(offset, offset + perPage)
}

async function findOne(id: string, token: string) {
  console.log('findOne ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/plannings/' + id,
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
  console.log('findAll ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/plannings', {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
  }).catch((error) => console.log(error))
  console.log(data)
  return Promise.resolve(data)
}

async function findAllStats(token: string) {
  console.log('findAllStats ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/plannings/stats',
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

async function createPlanning(packageId: string, body: any, token: string) {
  console.log('createPlanning ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/plannings/' + packageId,
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

async function updatePlanning(id: string, body: any, token: string) {
  console.log('updatePlanning ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/plannings/' + id,
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

async function deletePlanning(id: string, token: string) {
  console.log('deletePlanning ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/plannings/' + id,
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
