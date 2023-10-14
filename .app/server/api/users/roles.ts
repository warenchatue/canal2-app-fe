export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '10', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const token = (query.token as string) || ''
  const id = (query.id as string) || ''
  const action = (query.action as string) || 'get'

  console.log(action)

  if (action == 'findAll') {
    const data = await findAll(token)
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
    }
  } else if (action == 'createRole') {
    const body = await readBody(event)
    const data = await createRole(body, token)
    return { data: data, success: true }
  } else if (action == 'updateRole') {
    const body = await readBody(event)
    const data = await updateRole(id, body, token)
    return { data: data, success: true }
  } else if (action == 'deleteRole') {
    const data = await deleteRole(id, token)
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
      return [item.name, item.tag].some((item) => item.match(filterRe))
    })
    .slice(offset, offset + perPage)
}

async function findAll(token: string) {
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/roles', {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
  }).catch((error) => console.log(error))
  console.log(data)

  return Promise.resolve(data)
}

async function createRole(body: any, token: string) {
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/roles', {
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

async function updateRole(id: string, body: any, token: string) {
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/roles/' + id, {
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

async function deleteRole(id: string, token: string) {
  console.log('deleteRole ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/roles/' + id, {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
  }).catch((error) => console.log(error))
  console.log(data)

  return Promise.resolve(data)
}
