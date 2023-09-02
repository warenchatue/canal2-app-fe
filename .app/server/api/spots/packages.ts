export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''
  const id = (query.id as string) || ''
  const action = (query.action as string) || 'get'

  if (perPage >= 50) {
    // Create an artificial delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log(action)

  if (action == 'get') {
    const data = await getPackages()
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
      package: id ? data.find((item) => item.id === id) : undefined,
    }
  } else if (action == 'post') {
    const body = await readBody(event)
    console.log(body)
    const data = await getPackages()

    const Packages = data.filter(
      (d) => d.label == body.username && d.amount == body.password,
    )
    if (Packages?.length == 1) {
      console.log('user found')
      return {
        data: Packages[0],
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
      return [item.announcer.name, item.date, item.label].some((item) =>
        item.match(filterRe),
      )
    })
    .slice(offset, offset + perPage)
}

async function createUser() {}
async function getPackages() {
  return Promise.resolve([
    {
      id: '0',
      date: '12/04/2022',
      label: 'FACT N°X07012',
      amount: '500 000',
      numberSpots: 8,
      numberPlay: 7,
      numberFiles: 2,
      period: 'September - October',
      planning: [
        {
          date: '2023-09-01T10:25:00.000Z',
          isAutoPlay: false,
          isManualPlay: false,
          spot: {
            id: '0',
            date: '12/04/2022',
            product: 'Canal2 Or',
            message: 'Canal2 Or',
            type: 'SPOT',
            logo: '',
            file: '',
            duration: '58s',
            tag: 'A',
            isPlay: false,
          },
        },
        {
          date: '2023-10-01T10:25:00.000Z',
          isAutoPlay: false,
          isManualPlay: false,
          spot: {
            id: '0',
            date: '12/04/2022',
            product: 'Canal2 Or',
            message: 'Canal2 Or',
            type: 'SPOT',
            logo: '',
            file: '',
            duration: '58s',
            tag: 'A',
            isPlay: false,
          },
        },
        {
          date: '2023-10-01T10:25:00.000Z',
          isAutoPlay: false,
          isManualPlay: false,
          spot: {
            id: '1',
            date: '12/04/2022',
            product: 'Canal2 Or BA',
            message: 'Canal2 Or BA',
            type: 'BA',
            logo: '',
            file: '',
            duration: '50s',
            tag: 'B',
            isPlay: false,
          },
        },
      ],
      spots: [
        {
          id: '0',
          date: '12/04/2022',
          product: 'Canal2 Or',
          message: 'Canal2 Or',
          type: 'SPOT',
          logo: '',
          file: '',
          duration: '58s',
          tag: 'A',
          isPlay: false,
        },
        {
          id: '1',
          date: '12/04/2022',
          product: 'Canal2 Or BA',
          message: 'Canal2 Or BA',
          type: 'BA',
          logo: '',
          file: '',
          duration: '50s',
          tag: 'B',
          isPlay: false,
        },
      ],
      announcer: {
        id: '0',
        name: 'Canal2 International',
        email: 'info@cana2international.net',
        logo: '/img/avatars/company.svg',
        status: 'active',
      },
      obs: '',
      status: 'active',
    },
    {
      id: '1',
      date: '12/05/2022',
      label: 'FACT N°X07412',
      amount: '700 000',
      numberSpots: 12,
      numberPlay: 12,
      numberFiles: 2,
      period: 'September - October',
      planning: [
        {
          date: '2023-10-01T10:25:00.000Z',
          isAutoPlay: false,
          isManualPlay: false,
          spot: {
            id: '0',
            date: '12/05/2022',
            product: 'IUG Campus numérique',
            message: 'IUG Campus numérique',
            type: 'SPOT',
            logo: '',
            file: '',
            duration: '48s',
            tag: 'A',
            isPlay: false,
          },
        },
      ],
      spots: [
        {
          id: '0',
          date: '12/05/2022',
          product: 'IUG Campus numérique',
          message: 'IUG Campus numérique',
          type: 'SPOT',
          logo: '',
          file: '',
          duration: '48s',
          tag: 'A',
          isPlay: false,
        },
        {
          id: '1',
          date: '12/05/2022',
          product: 'IUG 30 ans',
          message: 'IUG 30 ans',
          type: 'SPOT',
          logo: '',
          file: '',
          duration: '38s',
          tag: 'B',
          isPlay: false,
        },
      ],
      announcer: {
        id: '1',
        name: 'IUG',
        email: 'info@iug.com',
        logo: '/img/avatars/company.svg',
        status: 'active',
      },
      obs: '',
      status: 'closed',
    },
    {
      id: '2',
      date: '20/06/2023',
      label: 'FACT N°X07112',
      amount: '900 000',
      numberSpots: 6,
      numberPlay: 5,
      numberFiles: 1,
      period: 'October',
      planning: [],
      spots: [
        {
          id: '0',
          date: '20/06/2023',
          product: 'IUC nouveau campus',
          message: 'IUC nouveau campus',
          type: 'SPOT',
          logo: '',
          file: '',
          duration: '45s',
          tag: 'A',
          isPlay: false,
        },
      ],
      announcer: {
        id: '2',
        date: '20/06/2023',
        name: 'IUC',
        email: 'info@myiuc.com',
        logo: '/img/avatars/company.svg',
        status: 'active',
      },
      obs: '',
      status: 'active',
    },
    {
      id: '3',
      date: '20/08/2023',
      label: 'FACT N°X07112',
      amount: '1 200 000',
      numberSpots: 18,
      numberPlay: 18,
      numberFiles: 2,
      period: 'October',
      planning: [],
      spots: [
        {
          id: '0',
          date: '20/08/2023',
          product: 'IUC Parainage niveau 1',
          message: 'IUC Parainage niveau 1',
          type: 'SPOT',
          logo: '',
          file: '',
          duration: '58s',
          tag: 'A',
          isPlay: false,
        },
        {
          id: '1',
          date: '20/08/2023',
          product: 'IUC nouveau programme de master',
          message: 'IUC nouveau programme de master',
          type: 'SPOT',
          logo: '',
          file: '',
          duration: '52s',
          tag: 'B',
          isPlay: false,
        },
      ],
      announcer: {
        id: '2',
        name: 'IUC',
        email: 'info@myiuc.com',
        logo: '/img/avatars/company.svg',
        status: 'active',
      },
      obs: '',
      status: 'closed',
    },
  ])
}
async function updatePackage() {}
