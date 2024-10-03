const signout = (router) => {
  sessionStorage.removeItem('user')
  sessionStorage.removeItem('token')
  router.push({ name: 'login' })
}

export default signout
