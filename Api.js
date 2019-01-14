import queryString from 'query-string'
import { replacer } from 'app/util/JsonUtils'

const server = 'https://api.pinboard.in/v1'

const userTokenUrl = (parameters) => `${server}/user/api_token/?${parameters}`
const userSecretUrl = (parameters) => `${server}/user/secret/?${parameters}`
const postsUpdateUrl = (parameters) => `${server}/posts/update/?${parameters}`
const postsAllUrl = (parameters) => `${server}/posts/all/?${parameters}`
const postsAddUrl = (parameters) => `${server}/posts/add/?${parameters}`
const postsDeleteUrl = (parameters) => `${server}/posts/delete/?${parameters}`
const postsStarredUrl = (secret, username) => `https://feeds.pinboard.in/rss/secret:${secret}/u:${username}/starred/`

const handleResponse = (response, rss = false) => {
  if (!response.ok) {
    console.warn(response.status)
    return Promise.resolve({ ok: 0, error: response.status })
  }
  return rss ? response.text() : response.json()
}

const fetchWithErrorHandling = (url) => {
  return fetch(url)
    .catch(e => ({ ok: 0, error: e }))
    .then(handleResponse)
}

const userToken = (token) => {
  const data = {
    format: 'json',
    auth_token: token,
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(userTokenUrl(params))
}

const userSecret = (token) => {
  const data = {
    format: 'json',
    auth_token: token,
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(userSecretUrl(params))
}

const postsUpdate = (token) => {
  const data = {
    format: 'json',
    auth_token: token,
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(postsUpdateUrl(params))
}

const postsAll = (token) => {
  const data = {
    format: 'json',
    auth_token: token,
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(postsAllUrl(params))
}

const postsAdd = (post, token) => {
  const data = {
    url: post.href,
    description: post.description,
    extended: post.extended,
    tags: replacer('tags', post.tags),
    toread: replacer('toread', post.toread),
    shared: replacer('shared', post.shared),
    format: 'json',
    auth_token: token,
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(postsAddUrl(params))
}

const postsDelete = (post, token) => {
  const data = {
    url: post.href,
    format: 'json',
    auth_token: token,
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(postsDeleteUrl(params))
}

const postsStarred = (secret, token) => {
  const username = token.split(':')[0]
  return fetch(postsStarredUrl(secret, username))
    .catch(e => ({ ok: 0, error: e }))
    .then(response => handleResponse(response, true))
}

const mockUpdate = () => {
  const now = new Date()
  return { 'update_time': now.toISOString() }
}

const mockPostsAll = () => {
  const mock = 'http://192.168.86.29:3000/posts.json'
  return fetchWithErrorHandling(mock)
}

export default {
  userToken,
  userSecret,
  postsUpdate,
  postsAll,
  postsAdd,
  postsDelete,
  postsStarred,
  mockPostsAll,
  mockUpdate,
}
