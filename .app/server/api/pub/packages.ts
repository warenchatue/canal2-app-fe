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
    const response = await findAll(token)
    return {
      total: response.metaData.totalItems ?? 0,
      metaData: response.metaData ?? {},
      data: filterData(response.data, filter, page, perPage),
    }
  } else if (action == 'findAllReport') {
    const response = await findAll(token)
    return {
      total: response.metaData.totalItems,
      metaData: response.metaData,
      data: filterData(response.data, filter, page, perPage, true),
    }
  } else if (action == 'createPackage') {
    const body = await readBody(event)
    console.log(body)
    const data = await createPackage(body, token)
    return { data: data, success: true }
  } else if (action == 'updatePackage') {
    const body = await readBody(event)
    const data = await updatePackage(id, body, token)
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
) {
  const offset = (page - 1) * perPage
  data = data.sort((a: any, b: any) => {
    return a.createdAt < b.createdAt ? 1 : -1
  })
  if (isReport == true) {
    let totalPending = 0
    data = data.map((item) => {
      totalPending += item.invoice.pending
      const plannings = item.plannings.sort((a: any, b: any) => {
        return a.date < b.date ? -1 : 1
      })
      console.log('Sorted plannings')
      console.log(plannings)
      if (plannings.length > 0) {
        const d2 = new Date(plannings[plannings.length - 1].date ?? '')
        const d1 = new Date(plannings[0].date ?? '')
        const diff = Math.abs(d2 - d1)
        const durationDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
        const totalDiffused = plannings.filter((e: any) => {
          return e.isManualPlay == true || e.isAutoPlay == true
        }).length
        item.durationDays = durationDays + 1
        item.totalDiffused = totalDiffused
        item.startDate = new Date(plannings[0].date).toLocaleDateString('fr-FR')
        item.endDate = new Date(
          plannings[plannings.length - 1].date,
        ).toLocaleDateString('fr-FR')
      } else {
        item.durationDays = 0
        item.totalDiffused = 0
        item.startDate = ''
        item.endDate = ''
      }
      console.log(item)
      return item
    })
    if (data.length > 0) {
      data[0].globalPending = totalPending
    }
  }

  if (!filter) {
    return data.slice(offset, offset + perPage)
  }
  const filterRe = new RegExp(filter, 'i')
  return data
    .filter((item) => {
      return [item.code, item.label].some((item) => item.match(filterRe))
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
  console.log(data)
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
  console.log(data)
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
  console.log(data)
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
  console.log(data)
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
  console.log(data)
  return Promise.resolve(data)
}

function makeId(length: number) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#!&'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}
