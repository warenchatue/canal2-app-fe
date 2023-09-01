export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const action = (query.action as string) || 'get'

  if (perPage >= 50) {
    // Create an artificial delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log(action)

  if (action == 'get') {
    const data = await getTontines()
    return {
      total: data.data.length,
      header: data.header,
      meta: data.meta,
      data: filterData(data.data, filter, page, perPage),
    }
  } else if (action == 'post') {
    const body = await readBody(event)
    console.log(body)
    const data = await getTontines()

    const tontines = data.filter(
      (d) => d.name == body.username && d.cagnote == body.password,
    )
    if (tontines?.length == 1) {
      console.log('user found')
      return {
        data: tontines[0],
      }
    } else {
      console.log('user not found')
      return {
        data: null,
      }
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
      return [item[1], item[2], item[3]].some((item) => item.match(filterRe))
    })
    .slice(offset, offset + perPage)
}

async function createTontine() {}
async function getTontines() {
  const baseUrl = 'https://qolect-be-develop-zjd5mpdgzq-uc.a.run.app/'
  const authType = 'Bearer'
  const accessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDVkMmQ5NTg2ODBmNzJmNzM2YjZiNTMiLCJzdGF0ZSI6ImFjdGl2ZSIsImZpcnN0TmFtZSI6IkpvcmRhbiIsImxhc3ROYW1lIjoiQU5BRkFDSyIsImVtYWlsIjoiYWRtaW4yQHRlc3QuY29tIiwicGhvbmUiOiIrMjM3Njk0NjgyNzEzIiwiYXBwUm9sZSI6InN1cGVyQWRtaW4iLCJ1c2VyVHlwZSI6ImNvcnBvcmF0ZSIsIm93bmVkR3JvdXBzIjowLCJub3RpZmljYXRpb25zQ291bnQiOjczLCJncm91cHNDb3VudCI6MCwibm90aWZpY2F0aW9ucyI6WyI2NDVkMzM3Yzg2ODBmNzJmNzM2YjZiOTAiLCI2NDVkMzQwNDg2ODBmNzJmNzM2YjZiYmMiLCI2NDVkMzQxNjg2ODBmNzJmNzM2YjZiY2MiLCI2NDVkMzQyMzg2ODBmNzJmNzM2YjZiZGMiLCI2NDVkMzQ0MTg2ODBmNzJmNzM2YjZiZmQiLCI2NDVkMzQ0ZTg2ODBmNzJmNzM2YjZjMGQiLCI2NDVkMzQ1Yjg2ODBmNzJmNzM2YjZjMWQiLCI2NDVkMzU0Mjg2ODBmNzJmNzM2YjZjNDEiLCI2NDVkM2M4MTg2ODBmNzJmNzM2YjZjNzYiLCI2NDVkM2VjMjg2ODBmNzJmNzM2YjZjODYiLCI2NDVkM2YxZTg2ODBmNzJmNzM2YjZjOWYiLCI2NDVkNGJlOWJlOWMxOGM1NWM3MGRiNDkiLCI2NDVkNGMyYWJlOWMxOGM1NWM3MGRiNjciLCI2NDVkNGM0MmJlOWMxOGM1NWM3MGRiNzciLCI2NDVlNjM1NjU3ODdkYzZmOTgyY2NlMzUiLCI2NDYwYmRlMGFmM2IzYzU1NzZjZmJmNGMiLCI2NDYwYmRlNWFmM2IzYzU1NzZjZmJmNWMiLCI2NDYwYmRmYmFmM2IzYzU1NzZjZmJmNmQiLCI2NDYwYmUwNmFmM2IzYzU1NzZjZmJmODIiLCI2NDYwYmUwYWFmM2IzYzU1NzZjZmJmOTIiLCI2NDYwYmUxNmFmM2IzYzU1NzZjZmJmYTciLCI2NDYwYmUxYWFmM2IzYzU1NzZjZmJmYjciLCI2NDYwYmUyZGFmM2IzYzU1NzZjZmJmYzgiLCI2NDcwNTc5ZTVlYzFiNDljZWM1M2RhYTMiLCI2NDcwNTdlNDVlYzFiNDljZWM1M2RhYjIiLCI2NDcwNTgyYjVlYzFiNDljZWM1M2RhZDEiLCI2NDcwNTg0MTVlYzFiNDljZWM1M2RhZTAiLCI2NDcwNTllYjNmMzc2ODllYmNhZmM0M2QiLCI2NDcwNWEwZTNmMzc2ODllYmNhZmM0NGMiLCI2NDcwNWEzNTA4NTg1OTE1MzA3NjIxMWUiLCI2NDcwNWIyYjQ2MDY1ZmM1MDMwMDE3ZDMiLCI2NDcwNWI3YWRkMWUwOWI5ZWVhMTk3MTYiLCI2NDcwNWI4NWRkMWUwOWI5ZWVhMTk3MjQiLCI2NDcwNWMyOGRkMWUwOWI5ZWVhMTk3MzIiLCI2NDcwNWM0MWRkMWUwOWI5ZWVhMTk3NGQiLCI2NDcwNjIzNWJiZWRkOGYyODk4NjIwYTIiLCI2NDcxYjYyMDNlZDhmNjU0N2FjYzQyMzAiLCI2NDcxYjYyMDNlZDhmNjU0N2FjYzQyMzQiLCI2NDcxYjg4MjNlZDhmNjU0N2FjYzQyNWQiLCI2NDcxYjg4MjNlZDhmNjU0N2FjYzQyNjEiLCI2NDcxYmExYjNlZDhmNjU0N2FjYzQyNzUiLCI2NDcxYmExYjNlZDhmNjU0N2FjYzQyNzkiLCI2NDcxYmEyZDNlZDhmNjU0N2FjYzQyOGQiLCI2NDcxYmEyZDNlZDhmNjU0N2FjYzQyOTEiLCI2NDdiNjZkYTNhZjE0NTIyOGUxY2M3NjYiLCI2NDdiNjZkYzNhZjE0NTIyOGUxY2M3NzUiLCI2NDdiNjZkZTNhZjE0NTIyOGUxY2M3ODQiLCI2NDdiNjZkZjNhZjE0NTIyOGUxY2M3OTMiLCI2NDdiNjZlMDNhZjE0NTIyOGUxY2M3YTIiLCI2NDdiNjZlMjNhZjE0NTIyOGUxY2M3YjEiLCI2NDdiNjZlNDNhZjE0NTIyOGUxY2M3YzMiLCI2NDdiNjZlNjNhZjE0NTIyOGUxY2M3ZDIiLCI2NDdiNjZlNzNhZjE0NTIyOGUxY2M3ZTEiLCI2NDdiNjZlODNhZjE0NTIyOGUxY2M3ZjAiLCI2NDdiNjZlYTNhZjE0NTIyOGUxY2M3ZmYiLCI2NDdiNjZlYjNhZjE0NTIyOGUxY2M4MGUiLCI2NDdiNjg4YTNhZjE0NTIyOGUxY2M4NDciLCI2NDdiNjg4YzNhZjE0NTIyOGUxY2M4NTYiLCI2NDdiNjg4ZTNhZjE0NTIyOGUxY2M4NjUiLCI2NDdiNjg5MDNhZjE0NTIyOGUxY2M4NzQiLCI2NDdiNjg5MjNhZjE0NTIyOGUxY2M4ODMiLCI2NDdiNjg5MzNhZjE0NTIyOGUxY2M4OTIiLCI2NDdiNjhmNTNhZjE0NTIyOGUxY2M4YWYiLCI2NDdiNjhmOTNhZjE0NTIyOGUxY2M4ZDAiLCI2NDdiNjkxNDNhZjE0NTIyOGUxY2M4ZjQiLCI2NDdiNjkxYTNhZjE0NTIyOGUxY2M5MTUiLCI2NDdiNjkxZDNhZjE0NTIyOGUxY2M5MzYiLCI2NDdiNjkyMTNhZjE0NTIyOGUxY2M5NTciLCI2NDdiNjkyNTNhZjE0NTIyOGUxY2M5NzgiLCI2NDdiNjkyODNhZjE0NTIyOGUxY2M5OTkiLCI2NDdiNjkyYzNhZjE0NTIyOGUxY2M5YmEiLCI2NDdiNjkzMDNhZjE0NTIyOGUxY2M5ZGIiLCI2NGE4MGQ4NTFlYTcyZTllNjcwOTA4MDMiLCI2NGE4MGRhNTFlYTcyZTllNjcwOTA4MmIiLCI2NGE4MGRhYTFlYTcyZTllNjcwOTA4NGMiLCI2NGE4MGRhZjFlYTcyZTllNjcwOTA4NmQiLCI2NGE4MGRiMzFlYTcyZTllNjcwOTA4OGUiLCI2NGE4MGRkNjFlYTcyZTllNjcwOTA4YjciLCI2NGE4MGRlNjFlYTcyZTllNjcwOTA4Y2YiLCI2NGE4MGRlOTFlYTcyZTllNjcwOTA4ZTQiLCI2NGE4MGRlZDFlYTcyZTllNjcwOTA4ZjYiLCI2NGE4MGRmMDFlYTcyZTllNjcwOTA5MDgiLCI2NGE4MGUxMTFlYTcyZTllNjcwOTA5MjMiLCI2NGE4MGUyMzFlYTcyZTllNjcwOTA5M2IiLCI2NGE4MGUyNjFlYTcyZTllNjcwOTA5NGQiLCI2NGE4MGUyYTFlYTcyZTllNjcwOTA5NWYiLCI2NGE4MGUyZDFlYTcyZTllNjcwOTA5NzEiLCI2NGE4NWQ2ZGYzN2E0ZDNiM2ZlOWI0N2UiLCI2NGE4NWQ4MWYzN2E0ZDNiM2ZlOWI0YTUiLCI2NGE4NWQ4NmYzN2E0ZDNiM2ZlOWI0YzYiLCI2NGE4NWRhOWYzN2E0ZDNiM2ZlOWI0ZTciLCI2NGE4NWRhZWYzN2E0ZDNiM2ZlOWI1MDgiLCI2NGE4YzM5MWFkMTFiYzNiNGJlOWFlOGYiLCI2NGNhZWZhMmU3ODJhYmM4NzFhYjg2MjIiLCI2NGNiMWQ5YjY5MWJmMWJhMzVkMDdlOWYiLCI2NGNiMWRkMjY5MWJmMWJhMzVkMDdlYjAiLCI2NGNiMzY2YWIzYjU0MDI3YTMwNTA3NTQiLCI2NGNiMzY2YWIzYjU0MDI3YTMwNTA3NTYiLCI2NGNiMzY2Y2IzYjU0MDI3YTMwNTA3NmMiLCI2NGNiMzY2Y2IzYjU0MDI3YTMwNTA3NmUiLCI2NGNiMzY2ZWIzYjU0MDI3YTMwNTA3ODQiLCI2NGNiMzY2ZWIzYjU0MDI3YTMwNTA3ODYiLCI2NGNiMzY3MGIzYjU0MDI3YTMwNTA3OWMiLCI2NGNiMzY3MGIzYjU0MDI3YTMwNTA3OWUiXSwiX192IjowLCJpYXQiOjE2OTIwMDI5MTQsImV4cCI6MTY5NDU5NDkxNH0.cnaoj0LiRXIdxltFYIgfRgb070P5Im0ZNpMppJmTWJ4'

  // const { data, pending, error }: any = await
  const data: any = await $fetch(
    baseUrl + 'njangiSummaries/generalNjangiReport',
    {
      method: 'get',
      headers: {
        'Content-type': 'application/json',
        Authorization: authType + ' ' + accessToken,
      },
    },
  ).catch((error) => console.log(error))
  // console.log(data)

  return Promise.resolve(data)

  // return Promise.resolve([
  //   {
  //     id: '0',
  //     name: 'Chez Chatue chaque 19',
  //     amount: '10 000 000',
  //     cagnote: '150 000 000',
  //     status: 'active',
  //     currency: {
  //       name: 'XAF',
  //     },
  //     description: '',
  //     logo: '/img/avatars/company.svg',
  //   },
  //   {
  //     id: '1',
  //     name: 'Chez Fokui chaque 06',
  //     amount: '2 000 000',
  //     cagnote: '36 000 000',
  //     status: 'active',
  //     currency: {
  //       name: 'XAF',
  //     },
  //     description: '',
  //     logo: '/img/avatars/company.svg',
  //   },
  //   {
  //     id: '2',
  //     name: 'Chez Fokui chaque 20',
  //     amount: '5 000 000',
  //     cagnote: '100 000 000',
  //     status: 'active',
  //     currency: {
  //       name: 'XAF',
  //     },
  //     description: '',
  //     logo: '/img/avatars/company.svg',
  //   },
  // ])
}
async function updateOperation() {}
