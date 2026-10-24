import axios from 'axios'

const baseUrl = '/api/blogs'
const config = token => ({ headers: { Authorization: `Bearer ${token}` } })
const getAll = async () => (await axios.get(baseUrl)).data
const create = async (blog, token) => (await axios.post(baseUrl, blog, config(token))).data
const update = async (blog, token) => (await axios.put(`${baseUrl}/${blog.id}`, {
  title: blog.title, author: blog.author, url: blog.url, likes: blog.likes, user: blog.user.id,
}, config(token))).data
const remove = async (id, token) => { await axios.delete(`${baseUrl}/${id}`, config(token)) }
const login = async credentials => (await axios.post('/api/login', credentials)).data
const getUsers = async () => (await axios.get('/api/users')).data
const comment = async (id, comment) => (await axios.post(baseUrl + '/' + id + '/comments', { comment })).data
export default { getAll, create, update, remove, login, getUsers, comment }
