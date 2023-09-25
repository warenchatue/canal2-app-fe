import { UserPayloadInterface } from '~/stores/auth'
import { User } from '~/types/user'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const action = (query.action as string) || 'login'

  console.log(action)
  // login
  if (action == 'login') {
    const body = await readBody(event)
    const data = await login(body)
    return { data: data, success: true }
    // register
  } else if (action == 'register') {
    const body = await readBody(event)
    const finalBody = {
      ...body,
      provider: 'local',
      userType: 'personal',
      appRole: body.appRole?._id,
      country: body.country?._id
    }
    console.log(finalBody)
    const data = await register(finalBody)
    if (data) {
      return data
    } else {
      return null
    }
  }
})

async function login(body: UserPayloadInterface) {
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/auth/login', {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: body,
  }).catch((error) => console.log(error))
  console.log(data)

  return Promise.resolve(data)
}

async function register(body: User) {
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(runtimeConfig.env.apiUrl + '/auth/register', {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: body,
  }).catch((error) => console.log(error))
  console.log(data)

  return Promise.resolve(data)
}
