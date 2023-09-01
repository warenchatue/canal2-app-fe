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
    const data = await getUsers()
    return {
      total: data.length,
      data: filterData(data, filter, page, perPage),
    }
  } else if (action == 'post') {
    const body = await readBody(event)
    console.log(body)
    const data = await getUsers()

    const users = data.filter(
      (d) => d.email == body.username && d.password == body.password,
    )
    if (users?.length == 1) {
      console.log('user found')
      return {
        data: users[0],
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
      return [item.firstName, item.lastName, item.email].some((item) =>
        item.match(filterRe),
      )
    })
    .slice(offset, offset + perPage)
}

async function createUser() {}
async function getUsers() {
  return Promise.resolve([
    {
      id: '0',
      firstName: 'Paul',
      lastName: 'Micheal',
      email: 'ja@gmail.com',
      status: 'active',
      token: 'xa',
      password: 'test',
      role: 'member',
      medias: {
        avatar: '/img/avatars/5.svg',
        flag: '/img/icons/flags/united-states-of-america.svg',
      },
      notifications: [],
    },
    {
      id: '1',
      firstName: 'Jordan',
      lastName: 'ANAFACK',
      email: 'anafackjordan@gmail.com',
      status: 'active',
      token: 'xa',
      password: 'test',
      role: 'admin',
      medias: {
        avatar: '/img/avatars/5.svg',
        flag: '/img/icons/flags/united-states-of-america.svg',
      },
      notifications: [],
    },
    {
      id: '2',
      firstName: 'Diderot',
      lastName: 'AR.',
      email: 'jordananafack@gmail.com',
      status: 'active',
      token: 'xb',
      password: 'test2',
      role: 'member',
      medias: {
        avatar: '/img/avatars/4.svg',
        flag: '/img/icons/flags/united-states-of-america.svg',
      },
    },
  ])
}
async function updateUser() {}
