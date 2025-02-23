import makeId from '~/server/utils'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const isActive = (query.filter as boolean) || false
  const action = (query.action as string) || 'get'
  const id = (query.id as string) || ''
  const token = (query.token as string) || ''
  const code = (query.code as string) || ''

  if (action == 'findOne') {
    const data = await findOne(id, token)
    return { data: data, success: true }
  } else if (action == 'findAll') {
    const response = await findAllPagination(token, perPage, page, filter)
    return {
      total: response.stats.totalItems ?? 0,
      stats: response.stats,
      metaData: response.results.data ?? {},
      data: response.results.data,
    }
  } else if (action == 'findAllLightByCode') {
    const data = await findAllLightByCode(code, token)
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
    }
  } else if (action == 'findAllReport') {
    const response = await findAllFollowup(isActive, token)
    return {
      total: response.metaData.totalItems ?? 0,
      metaData: response.metaData,
      data: filterData(response.data, filter, page, perPage, false),
    }
  } else if (action == 'addTvProgram') {
    const body = await readBody(event)
    console.log(body)
    const data = await addTvProgram(id, body, token)
    return { data: data, success: true }
  } else if (action == 'deleteTvProgram') {
    const body = await readBody(event)
    console.log(body)
    const data = await deleteTvProgram(id, body, token)
    return { data: data, success: true }
  } else if (action == 'addHour') {
    const body = await readBody(event)
    console.log(body)
    const data = await addHour(id, body, token)
    return { data: data, success: true }
  } else if (action == 'deleteHour') {
    const body = await readBody(event)
    console.log(body)
    const data = await deleteHour(id, body, token)
    return { data: data, success: true }
  } else if (action == 'createPackage') {
    const body = await readBody(event)
    console.log(body)
    const data = await createPackage(body, token)
    return { data: data, success: true }
  } else if (action == 'updatePackage') {
    const body = await readBody(event)
    const data = await updatePackage(id, body, token)
    return { data: data, success: true }
  } else if (action == 'updatePackagePartial') {
    const body = await readBody(event)
    const data = await updatePackagePartial(id, body, token)
    return { data: data, success: true }
  } else if (action == 'sync') {
    const data = await syncCampaign(id, token)
    return { data: data, success: true }
  } else if (action == 'delete') {
    const data = await deletePackage(id, token)
    return { data: data, success: true }
  }
})

function filterData(
  data: any[],
  filter: string,
  page: number,
  perPage: number,
  isReport = false,
  isActive = false,
) {
  const offset = (page - 1) * perPage
  data = data.sort((a: any, b: any) => {
    return a.createdAt < b.createdAt ? 1 : -1
  })
  // if (isReport == true) {
  //   let totalPending = 0
  //   data = data.map((item) => {
  //     totalPending += item.invoice?.pending ?? 0
  //     const plannings = item.plannings.sort((a: any, b: any) => {
  //       return a.date < b.date ? -1 : 1
  //     })
  //     // console.log('Sorted plannings')
  //     if (plannings.length > 0) {
  //       const d2 = new Date(plannings[plannings.length - 1].date ?? '')
  //       const d1 = new Date(plannings[0].date ?? '')
  //       const diff = Math.abs(d2 - d1)
  //       const durationDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
  //       const totalDiffused = plannings.filter((e: any) => {
  //         return e.isManualPlay == true || e.isAutoPlay == true
  //       }).length
  //       item.durationDays = durationDays + 1
  //       item.totalDiffused = totalDiffused
  //       item.startDate = new Date(plannings[0].date).toLocaleDateString('fr-FR')
  //       item.endDate = new Date(
  //         plannings[plannings.length - 1].date,
  //       ).toLocaleDateString('fr-FR')
  //     } else {
  //       item.durationDays = 0
  //       item.totalDiffused = 0
  //       item.startDate = ''
  //       item.endDate = ''
  //     }
  //     // console.log(item)
  //     return item
  //   })
  //   if (data.length > 0) {
  //     data[0].globalPending = totalPending
  //   }
  // }

  if (!filter) {
    return data.slice(offset, offset + perPage)
  }
  const filterRe = new RegExp(filter, 'i')
  return data
    .filter((item) => {
      return [item.code ?? '', item.label ?? ''].some((item) =>
        item.match(filterRe),
      )
    })
    .slice(offset, offset + perPage)
}

async function findOne(id: string, token: string) {
  console.log('findOne ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/packages/' + id, {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
  }).catch((error) => console.log(error))
  // console.log(data)
  return Promise.resolve(data)
}

async function findAllPagination(
  token: string,
  perPage: number,
  page: number,
  search: string,
) {
  console.log('findAllPagination ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl +
      '/packages/paginate?perPage=' +
      perPage +
      '&page=' +
      page +
      '&states=active' +
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
  // console.log(data)
  return Promise.resolve(data)
}

async function findAll(token: string) {
  console.log('findAll ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/packages', {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
  }).catch((error) => console.log(error))
  // console.log(data)
  return Promise.resolve(data)
}

async function findAllLightByCode(code: string, token: string) {
  console.log('findAllLightByCode ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/packages/all/by/code?campaignCode=' + code,
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

async function findAllFollowup(isActive: boolean, token: string) {
  console.log('findAll ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl +
      '/packages/campaigns-followup?isActive=' +
      isActive +
      '&perPage=' +
      10000,
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

async function createPackage(body: any, token: string) {
  console.log('createPackage ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/packages', {
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
    body: { ...body, code: makeId(4) + '_' + makeId(4) },
  }).catch((error) => console.log(error))
  // console.log(data)
  return Promise.resolve(data)
}

async function updatePackage(id: string, body: any, token: string) {
  console.log('updatePackage ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/packages/' + id, {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
    body: body,
  }).catch((error) => console.log(error))
  // console.log(data)
  return Promise.resolve(data)
}

async function updatePackagePartial(id: string, body: any, token: string) {
  console.log('updatePackagePartial ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/packages/' + id, {
    method: 'PATCH',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
    body: body,
  }).catch((error) => console.log(error))
  // console.log(data)
  return Promise.resolve(data)
}

async function addTvProgram(id: string, body: any, token: string) {
  console.log('addTvProgram ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl +
      '/packages/' +
      id +
      '/add-tv-program/' +
      body.tvProgramId,
    {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
    },
  ).catch((error) => console.log(error))
  return Promise.resolve(data)
}

async function deleteTvProgram(id: string, body: any, token: string) {
  console.log('deleteTvProgram ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl +
      '/packages/' +
      id +
      '/delete-tv-program/' +
      body.tvProgramId,
    {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
    },
  ).catch((error) => console.log(error))
  return Promise.resolve(data)
}

async function addHour(id: string, body: any, token: string) {
  console.log('addHour ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/packages/' + id + '/add-hour/' + body.hourId,
    {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
    },
  ).catch((error) => console.log(error))
  return Promise.resolve(data)
}

async function deleteHour(id: string, body: any, token: string) {
  console.log('deleteHour ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl +
      '/packages/' +
      id +
      '/delete-hour/' +
      body.hourId,
    {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
    },
  ).catch((error) => console.log(error))
  return Promise.resolve(data)
}

async function syncCampaign(id: string, token: string) {
  console.log('syncCampaign ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/packages/' + id + '/sync',
    {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
    },
  ).catch((error) => console.log(error))
  // console.log(data)
  return Promise.resolve(data)
}

async function deletePackage(id: string, token: string) {
  console.log('deletePackage ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/packages/' + id, {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
  }).catch((error) => console.log(error))
  // console.log(data)
  return Promise.resolve(data)
}
