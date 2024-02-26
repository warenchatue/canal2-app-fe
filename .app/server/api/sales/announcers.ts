export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const action = (query.action as string) || 'get'
  const id = (query.id as string) || ''
  const token = (query.token as string) || ''

  if (action == 'findOne') {
    const data = await findOne(id, token)
    return { data: data, success: true }
  } else if (action == 'findAll') {
    const data = await findAll(token)
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
    }
  } else if (action == 'findAllLight') {
    const data = await findAllLight(token)
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
    }
  } else if (action == 'createAnnouncer') {
    const body = await readBody(event)
    console.log(body)
    const data = await createAnnouncer(body, token)
    return { data: data, success: true }
  } else if (action == 'updateAnnouncer') {
    const body = await readBody(event)
    const data = await updateAnnouncer(id, body, token)
    return { data: data, success: true }
  } else if (action == 'delete') {
    const data = await deleteAnnouncer(id, token)
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
    return data.slice(offset, offset + perPage)
  }
  const filterRe = new RegExp(filter, 'i')
  return data
    .filter((item) => {
      return [item.code, item.name, item.email].some((item) =>
        item?.match(filterRe),
      )
    })
    .slice(offset, offset + perPage)
}

async function findOne(id: string, token: string) {
  console.log('findOne ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/announcers/' + id,
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
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/announcers', {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
  }).catch((error) => console.log(error))
  // console.log(data)
  return Promise.resolve(data)
}

async function findAllLight(token: string) {
  console.log('findAllLight ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/announcers/all/light',
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

async function createAnnouncer(body: any, token: string) {
  console.log('createAnnouncer ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/announcers', {
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
    body: body,
  }).catch((error) => console.log(error))
  console.log(data)
  return Promise.resolve(data)
}

async function updateAnnouncer(id: string, body: any, token: string) {
  console.log('updateAnnouncer ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/announcers/' + id,
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

async function deleteAnnouncer(id: string, token: string) {
  console.log('deleteAnnouncer ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/announcers/' + id,
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
