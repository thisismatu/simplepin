import queryString from 'query-string'
import {Platform} from 'react-native'

const server = 'https://api.pinboard.in/v1'

const loginUrl = (parameters) => `${server}/user/api_token/?${parameters}`
const updateUrl = (parameters) => `${server}/posts/update/?${parameters}`
const postsUrl = (parameters) => `${server}/posts/all/?${parameters}`

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
    'auth_token': token
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(loginUrl(params))
}

const update = (token) => {
  const data = {
   'format': 'json',
   'auth_token': token
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(updateUrl(params))
}

const posts = (token) => {
  const data = {
   'format': 'json',
   'auth_token': token
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(postsUrl(params))
}

const mockPosts = () => {
  const baseurl = Platform.OS === 'android' ? 'http://10.0.2.2' : 'http://localhost'
  const mockdata = baseurl + ':3000/posts.json'
  return fetchWithErrorHandling(mockdata)
}

export default {
  login, update, posts, mockPosts
}