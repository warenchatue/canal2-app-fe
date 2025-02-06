export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const perPage = parseInt((query.perPage as string) || '5', 10)
    const page = parseInt((query.page as string) || '1', 10)
    const filter = (query.filter as string) || ''
    const action = (query.action as string) || 'get'
    const id = (query.id as string) || ''
    const token = (query.token as string) || ''
  
    if (action === 'findOne') {
      const data = await findOne(id, token)
      return { data, success: true }
    } else if (action === 'findAll') {
      const data = await findAll(token)
      return {
        total: data.length,
        data: filterData(data, filter, page, perPage),
      }
    } else if (action === 'createAuthorization') {
      const body = await readBody(event)
      const data = await createAuthorization(body, token)
      return { data, success: true }
    } else if (action === 'updateAuthorization') {
      const body = await readBody(event)
      const data = await updateAuthorization(id, body, token)
      return { data, success: true }
    } else if (action === 'delete') {
      const data = await deleteAuthorization(id, token)
      return { data, success: true }
    }
  })
  
  function filterData(
    data: any[],
    filter: string,
    page: number,
    perPage: number
  ) {
    const offset = (page - 1) * perPage
    if (!filter) {
      return data.slice(offset, offset + perPage)
    }
    const filterRe = new RegExp(filter, 'i')
    return data
      .filter((item) =>
        [item.natureDescription, item.location, item.serviceInCharge].some(
          (field) => field.match(filterRe)
        )
      )
      .slice(offset, offset + perPage)
  }
  
  async function findOne(id: string, token: string) {
    console.log('findOne ' + token)
    const runtimeConfig = useRuntimeConfig()
    const data = await $fetch(
      runtimeConfig.env.apiUrl + '/broadcastAuthorization/' + id,
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-type': 'application/json',
        },
      }
    ).catch((error) => console.log(error))
    return Promise.resolve(data)
  }
  
  async function findAll(token: string) {
    console.log('findAll ' + token)
    const runtimeConfig = useRuntimeConfig()
    const data = await $fetch(
      runtimeConfig.env.apiUrl + '/broadcastAuthorization',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-type': 'application/json',
        },
      }
    ).catch((error) => console.log(error))
    return Promise.resolve(data)
  }
  
  async function createAuthorization(body: any, token: string) {
    console.log('createAuthorization ' + token)
    const runtimeConfig = useRuntimeConfig()
    const data = await $fetch(
      runtimeConfig.env.apiUrl + '/broadcastAuthorization',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-type': 'application/json',
        },
        body,
      }
    ).catch((error) => console.log(error))
    return Promise.resolve(data)
  }
  
  async function updateAuthorization(id: string, body: any, token: string) {
    console.log('updateAuthorization ' + token)
    const runtimeConfig = useRuntimeConfig()
    const data = await $fetch(
      runtimeConfig.env.apiUrl + '/broadcastAuthorization/' + id,
      {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-type': 'application/json',
        },
        body,
      }
    ).catch((error) => console.log(error))
    return Promise.resolve(data)
  }
  
  async function deleteAuthorization(id: string, token: string) {
    console.log('deleteAuthorization ' + token)
    const runtimeConfig = useRuntimeConfig()
    const data = await $fetch(
      runtimeConfig.env.apiUrl + '/broadcastAuthorization/' + id,
      {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-type': 'application/json',
        },
      }
    ).catch((error) => console.log(error))
    return Promise.resolve(data)
  }
  