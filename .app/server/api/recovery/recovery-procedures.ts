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
        e.team == team &&
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
      return (e.amount - e.paid ?? 0) > 0
    })
    return {
      total: response.metaData.totalItems,
      metaData: response.metaData,
      data: filterData(response.data, filter, page, perPage),
    }
  } else if (action == 'createRecoveryProcedure') {
    const body = await readBody(event)
    console.log(body)
    const data = await createRecoveryProcedure(body, token)
    return { data: data, success: true }
  } else if (action == 'updateRecoveryProcedure') {
    const body = await readBody(event)
    const data = await updateRecoveryProcedure(id, body, token)
    return { data: data, success: true }
  } else if (action == 'addRecoveryProcedurePayment') {
    const body = await readBody(event)
    const data = await addRecoveryProcedurePayment(id, body, token)
    return { data: data, success: true }
  } else if (action == 'delete') {
    const data = await deleteRecoveryProcedure(id, token)
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
        item.announcer?.name ?? '',
        item.agent1?.firstName ?? '' + item.agent1?.lastName ?? '',
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
    runtimeConfig.env.apiUrl + '/recovery-procedures/' + id,
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
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/recovery-procedures',
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

async function createRecoveryProcedure(body: any, token: string) {
  console.log('createRecoveryProcedure ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/recovery-procedures',
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

async function updateRecoveryProcedure(id: string, body: any, token: string) {
  console.log('updateRecoveryProcedure ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/recovery-procedures/' + id,
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

async function addRecoveryProcedurePayment(
  id: string,
  body: any,
  token: string,
) {
  console.log('addRecoveryProcedurePayment ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/recovery-procedures/' + id + '/addPayment',
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

async function deleteRecoveryProcedure(id: string, token: string) {
  console.log('deleteRecoveryProcedure ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/recovery-procedures/' + id,
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
