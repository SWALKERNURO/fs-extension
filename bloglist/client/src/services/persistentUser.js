const key = 'fullstackBlogUser'
export const getUser = () => {
  try {
    const user = JSON.parse(window.localStorage.getItem(key))
    return user && typeof user.token === 'string' && typeof user.username === 'string' ? user : null
  } catch {
    return null
  }
}
export const saveUser = (user) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(user))
  } catch {
    /* Current tab still works. */
  }
}
export const removeUser = () => {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* In-memory session still clears. */
  }
}
