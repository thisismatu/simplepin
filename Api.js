import queryString from 'query-string'

const server = 'https://api.pinboard.in/v1'

const loginUrl = (parameters) => `${server}/user/api_token/?${parameters}`
const updateUrl = (parameters) => `${server}/posts/update/?${parameters}`
const postsAllUrl = (parameters) => `${server}/posts/all/?${parameters}`
const postsAddUrl = (parameters) => `${server}/posts/add/?${parameters}`

const handleResponse = (response) => {
  if (!response.ok) {
    return Promise.resolve({ ok: 0, error: response.status })
  }
  return response.json()
}

const fetchWithErrorHandling = (url) => {
  return fetch(url)
    .catch(e => ({ ok: 0, error: e }))
    .then(handleResponse)
}

const login = (token) => {
  const data = {
    'format': 'json',
    'auth_token': token,
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(loginUrl(params))
}

const update = (token) => {
  const data = {
    'format': 'json',
    'auth_token': token,
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(updateUrl(params))
}

const postsAll = (token) => {
  const data = {
    'format': 'json',
    'auth_token': token,
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(postsAllUrl(params))
}

const postsAdd = (post, token) => {
  const data = {
    'url': post.href,
    'description': post.description,
    'extended': post.extended,
    'tags': post.tags,
    'toread': post.toread,
    'shared': post.shared,
    'format': 'json',
    'auth_token': token,
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(postsAddUrl(params))
}

const mockPosts = () => {
  const mock = 'http://192.168.0.18:3000/posts.json'
  return fetchWithErrorHandling(mock)
}

export default {
  login,
  update,
  postsAll,
  postsAdd,
  mockPosts,
}