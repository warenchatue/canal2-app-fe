import { storeToRefs } from 'pinia'

export default defineNuxtRouteMiddleware((to) => {
  const { authenticated } = storeToRefs(useAuthStore()) // make authenticated state reactive
  const token = useCookie('token') // get token from cookies
  console.log('Token '+ token.value)
  console.log(to?.name);

  if(to?.name?.toString().includes('bo') || to?.name?.toString().includes('dashboards')){
    if (token.value) {
      // check if value exists
      // todo verify if token is valid, before updating the state
      authenticated.value = true // update the state to authenticated
    }
  
    // if token exists and url is /login redirect to homepage
    if (token.value && to?.name === 'login') {
      return navigateTo('/')
      // if token exists and url is /login redirect to homepage
    }
  
    // if token doesn't exist redirect to log in
    if (!token.value && to?.name !== 'login') {
      abortNavigation()
      return navigateTo('/auth/login')
    }
  }

 
})
