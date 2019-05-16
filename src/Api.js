import queryString from 'query-string'
import { replacer } from './util/JsonUtil'
import { fetchWithErrorHandling } from './util/FetchUtil'

const server = 'https://api.pinboard.in/v1'

const userTokenUrl = (parameters) => `${server}/user/api_token/?${parameters}`
const userSecretUrl = (parameters) => `${server}/user/secret/?${parameters}`
const postsUpdateUrl = (parameters) => `${server}/posts/update/?${parameters}`
const postsAllUrl = (parameters) => `${server}/posts/all/?${parameters}`
const postsAddUrl = (parameters) => `${server}/posts/add/?${parameters}`
const postsDeleteUrl = (parameters) => `${server}/posts/delete/?${parameters}`
const postsStarredUrl = (secret, username) => `https://feeds.pinboard.in/rss/secret:${secret}/u:${username}/starred/`
const tagsAllUrl = (parameters) => `${server}/tags/get/?${parameters}`
const tagsSuggestedUrl = (parameters) => `${server}/posts/suggest/?${parameters}`

const userToken = token => {
  const data = {
    format: 'json',
    auth_token: token,
  }
  const params = queryString.stringify(data)
  const url = userTokenUrl(params)
  return fetchWithErrorHandling(url)
}

const userSecret = token => {
  const data = {
    format: 'json',
    auth_token: token,
  }
  const params = queryString.stringify(data)
  const url = userSecretUrl(params)
  return fetchWithErrorHandling(url)
}

const postsUpdate = token => {
  const data = {
    format: 'json',
    auth_token: token,
  }
  const params = queryString.stringify(data)
  const url = postsUpdateUrl(params)
  return fetchWithErrorHandling(url)
}

const postsAll = token => {
  const data = {
    format: 'json',
    auth_token: token,
  }
  const params = queryString.stringify(data)
  const url = postsAllUrl(params)
  return fetchWithErrorHandling(url)
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
  const url = postsAddUrl(params)
  return fetchWithErrorHandling(url)
}

const postsDelete = (href, token) => {
  const data = {
    url: href,
    format: 'json',
    auth_token: token,
  }
  const params = queryString.stringify(data)
  const url = postsDeleteUrl(params)
  return fetchWithErrorHandling(url)
}

const postsStarred = (secret, token) => {
  const username = token.split(':')[0]
  const url = postsStarredUrl(secret, username)
  return fetchWithErrorHandling(url, true)
}

const tagsAll = token => {
  const data = {
    format: 'json',
    auth_token: token,
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(tagsAllUrl(params))
}

const tagsSuggested = (url, token) => {
  const data = {
    url,
    format: 'json',
    auth_token: token,
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(tagsSuggestedUrl(params))
}

const mockUpdate = () => {
  const now = new Date()
  return { update_time: now.toISOString() }
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
  tagsAll,
  tagsSuggested,
  mockPostsAll,
  mockUpdate,
}
