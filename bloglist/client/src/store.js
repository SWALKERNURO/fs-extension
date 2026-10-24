import { create } from 'zustand'
import api from './services/api'
import { getUser, saveUser, removeUser } from './services/persistentUser'
let timer
export const useBlogStore = create((set, get) => ({
  user: getUser(), blogs: [], users: [], loading: true, loadError: '', notice: null,
  actions: {
    notify: (text, error = false) => {
      clearTimeout(timer); set({ notice: { text, error } })
      timer = setTimeout(() => set({ notice: null }), 5000)
    },
    loadBlogs: async () => {
      set({ loading: true, loadError: '' })
      try { set({ blogs: await api.getAll() }) }
      catch { set({ loadError: 'Could not load blogs. Please try again.' }) }
      finally { set({ loading: false }) }
    },
    loadUsers: async () => { set({ users: await api.getUsers() }) },
    login: async credentials => {
      const user = await api.login(credentials)
      saveUser(user); set({ user })
      get().actions.notify('Welcome, ' + (user.name || user.username))
    },
    logout: () => { removeUser(); set({ user: null }) },
    create: async values => {
      const user = get().user
      if (!user) throw new Error('Please log in')
      const blog = await api.create(values, user.token)
      set(state => ({ blogs: [...state.blogs, blog] }))
      get().actions.notify('Added ' + blog.title)
      return blog
    },
    like: async blog => {
      const user = get().user
      if (!user) throw new Error('Please log in')
      const updated = await api.update({ ...blog, likes: blog.likes + 1 }, user.token)
      set(state => ({ blogs: state.blogs.map(item => item.id === updated.id ? updated : item) }))
    },
    remove: async blog => {
      const user = get().user
      if (!user || user.username !== blog.user?.username) throw new Error('Only the creator can remove this blog')
      await api.remove(blog.id, user.token)
      set(state => ({ blogs: state.blogs.filter(item => item.id !== blog.id) }))
      get().actions.notify('Removed ' + blog.title)
    },
    addComment: async (id, content) => {
      const updated = await api.comment(id, content)
      set(state => ({ blogs: state.blogs.map(item => item.id === id ? updated : item) }))
      get().actions.notify('Comment added')
    },
  },
}))
