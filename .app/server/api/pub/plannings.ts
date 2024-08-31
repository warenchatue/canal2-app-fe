import moment from 'moment'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const action = (query.action as string) || 'get'
  const id = (query.id as string) || ''
  const orderCode = (query.orderCode as string) || ''
  const packageId = (query.packageId as string) || ''
  const token = (query.token as string) || ''
  const startDate = (query.startDate as string) || ''
  const endDate = (query.endDate as string) || ''

  if (action == 'findOne') {
    const data = await findOne(id, token)
    return { data: data, success: true }
  } else if (action == 'findToday') {
    const response = await findToday(token)
    return {
      total: response.data.length,
      metaData: response.metaData,
      data: filterData(
        response.data,
        filter,
        startDate,
        endDate,
        page,
        perPage,
        false,
      ),
    }
  } else if (action == 'findAll') {
    const response = await findAll(token)
    return {
      total: response.metaData.totalItems,
      metaData: response.metaData,
      data: filterData(
        response.data,
        filter,
        startDate,
        endDate,
        page,
        perPage,
        true,
      ),
    }
  } else if (action == 'findAllStats') {
    const response = await findAllStats(token)
    return {
      total: response.metaData.totalItems,
      metaData: response.metaData,
      data: filterData(
        response.data,
        filter,
        startDate,
        endDate,
        page,
        perPage,
        false,
      ),
    }
  } else if (action == 'createPlanning') {
    const body = await readBody(event)
    console.log(body)
    const data = await createPlanning(packageId, orderCode, body, token)
    return { data: data, success: true }
  } else if (action == 'createPlannings') {
    const body = await readBody(event)
    console.log(body)
    const data = await createPlannings(packageId, orderCode, body, token)
    return { data: data, success: true }
  } else if (action == 'updatePlanning') {
    const body = await readBody(event)
    console.log(body)
    const data = await updatePlanning(id, body, token)
    return { data: data, success: true }
  } else if (action == 'validatePlanningDiffusion') {
    const body = await readBody(event)
    console.log(body)
    const data = await updatePlanningDiffusionBulk(body, token)
    return { data: data, success: true }
  } else if (action == 'delete') {
    const data = await deletePlanning(id, token)
    return { data: data, success: true }
  } else if (action == 'bulkDelete') {
    const body = await readBody(event)
    console.log(body)
    const data = await bulkDeletePlanning(body, token)
    return { data: data, success: true }
  }
})

function filterData(
  data: any[],
  filter: string,
  startDate: string,
  endDate: string,
  page: number,
  perPage: number,
  isTvProg: boolean,
) {
  if (isTvProg == false) {
    console.log(data)
    data = data.filter(
      (item) =>
        item.isTvProgram == false && item.product?.package?.validator != null,
    )
  } else {
    data = data.filter((item) => item.product?.package?.validator != null)
  }
  data = data.sort((a: any, b: any) => {
    return a.position < b.position ? -1 : 1
  })
  const offset = (page - 1) * perPage
  if (!filter && !startDate) {
    return data
      .filter((item) => {
        return (
          moment(item.date).format('DD/MM/yyyy') ==
          moment().format('DD/MM/yyyy')
        )
      })
      .slice(offset, offset + perPage)
  }
  const filterRe = new RegExp(filter, 'i')
  const filteredData = data.filter((item) => {
    if (startDate && !filter) {
      // console.log('Start date: ' + startDate)
      // console.log('Item date: ' + item.date)
      var itemTime = new Date(
        new Date(item.date).toLocaleDateString(),
      ).getTime()
      // console.log('itemTime: ' + itemTime)
      var startTime = new Date(startDate).getTime()
      // console.log('startTime: ' + startTime)
      var endTime = new Date(endDate).getTime()
      // console.log('endTime: ' + endTime)

      return itemTime >= startTime && itemTime <= endTime
    } else if (filter) {
      return [
        item.product?.product,
        item.code,
        item.product?.package?.announcer?.name,
      ].some((item) => item.match(filterRe))
    }
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

async function findToday(token: string) {
  console.log('findToday ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/plannings/today',
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
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/plannings', {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
  }).catch((error) => console.log(error))
  // console.log(data)
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
  // console.log(data)
  return Promise.resolve(data)
}

async function createPlanning(
  packageId: string,
  orderCode: string,
  body: any,
  token: string,
) {
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
      body: { ...body, code: orderCode + '_' + makeId(4) },
    },
  ).catch((error) => console.log(error))
  console.log(data)
  return Promise.resolve(data)
}
async function createPlannings(
  packageId: string,
  orderCode: string,
  body: any,
  token: string,
) {
  console.log('createPlannings ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/plannings/' + packageId + '/bulk',
    {
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
      body: body.plannings,
    },
  ).catch((error) => console.log(error))
  // console.log(data)
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

async function updatePlanningDiffusionBulk(body: any, token: string) {
  console.log('updatePlanningDiffusionBulk ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/plannings/manual-validate/ids',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
      body,
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

async function bulkDeletePlanning(body: any, token: string) {
  console.log('bulkDeletePlanning ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/plannings/bulk-deletion/ids',
    {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
      body,
    },
  ).catch((error) => console.log(error))
  // console.log(data)
  return Promise.resolve(data)
}

function makeId(length: number) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}
