export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const id = (query.id as string) || ''
  const token = (query.token as string) || ''
  const action = (query.action as string) || 'get'

  if (action == 'finOne') {
    //
  } else if (action == 'findAll') {
    const data = await findAll(token)
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
    }
  } else if (action == 'createOrg') {
    const body = await readBody(event)
    console.log(body)
    const data = await createOrg(body, token)
    return { data: data, success: true }
  } else if (action == 'updateOrg') {
    const body = await readBody(event)
    const finalBody = {
      ...body,
      country: body.country?._id,
    }
    console.log(finalBody)
    const data = await updateOrg(id, finalBody, token)
    return { data: data, success: true }
  } else if (action == 'deleteOrg') {
    const data = await deleteOrg(id, token)
    return {
      data: data,
      success: typeof data === 'undefined' ? false : true,
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

async function findAll(token: string) {
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/orgs', {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
  }).catch((error) => console.log(error))
  // console.log(data)

  return Promise.resolve(data)
}

async function createOrg(body: any, token: string) {
  console.log('createOrg ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/orgs', {
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
    body: { ...body, country: body.country?._id },
  }).catch((error) => console.log(error))
  console.log(data)
  return Promise.resolve(data)
}

async function updateOrg(id: string, body: any, token: string) {
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/orgs/' + id, {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
    body: { ...body, country: body.country?._id },
  }).catch((error) => console.log(error))
  console.log(data)

  return Promise.resolve(data)
}

async function deleteOrg(id: string, token: string) {
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/orgs/' + id, {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
  }).catch((error) => console.log(error))
  console.log(data)

  return Promise.resolve(data)
}
