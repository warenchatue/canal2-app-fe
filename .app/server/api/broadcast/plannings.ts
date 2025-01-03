import moment from 'moment'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const action = (query.action as string) || 'get'
  const id = (query.id as string) || ''
  const token = (query.token as string) || ''
  const startDate = (query.startDate as string) || ''
  const endDate = (query.endDate as string) || ''

  if (action == 'findToday') {
    const responseProg = await findTodayProg(token)
    const responsePUB = await findTodayPUB(token)
    const allResp = [...responseProg.data, ...responsePUB.data]

    return {
      total: responseProg.data.length + responsePUB.data.length,
      metaData: responseProg.metaData,
      data: filterData(allResp, filter, startDate, endDate, page, perPage),
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
      ),
    }
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
) {
  data = data.filter(
    (item) =>
      (item.isTvProgram ? item.isTvProgram == false : true) &&
      (item.product ? item.product?.package?.validator != null : true),
  )

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
        item.tvProgram?.name ?? '',
        item.product?.name ?? '',
        item.code,
        item.tvProgramHost?.firstName ?? '',
      ].some((item) => item.match(filterRe))
    }
  })

  return filteredData.slice(offset, offset + perPage)
}

async function findTodayProg(token: string) {
  console.log('findTodayProg ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/programs-plannings/today',
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

async function findTodayPUB(token: string) {
  console.log('findTodayPUB ' + token)
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
  console.log('findAll - /programs-plannings ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/programs-plannings',
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

async function updatePlanning(id: string, body: any, token: string) {
  console.log('updatePlanning ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/programs-plannings/' + id,
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

async function updatePlanningDiffusionBulk(body: any, token: string) {
  console.log('updatePlanningDiffusionBulk ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/programs-plannings/manual-validate/ids',
    {
      method: 'POST',
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

async function deletePlanning(id: string, token: string) {
  console.log('deletePlanning ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/programs-plannings/' + id,
    {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
    },
  ).catch((error) => console.log(error))
  // console.log(data)
  return Promise.resolve(data)
}

async function bulkDeletePlanning(body: any, token: string) {
  console.log('bulkDeletePlanning ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/programs-plannings/bulk-deletion/ids',
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
