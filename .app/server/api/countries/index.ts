export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const id = (query.id as string) || ''
  const token = (query.token as string) || ''
  const action = (query.action as string) || 'get'

  if (action == 'findAll') {
    const data = await findAll(token)
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
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
      return [item.name, item.abbr, item.dial].some((item) =>
        item.match(filterRe),
      )
    })
    .slice(offset, offset + perPage)
}

async function findAll(token: string) {
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/countries', {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-type': 'application/json',
    },
  }).catch((error) => console.log(error))
  console.log(data)

  return Promise.resolve(data)
}
