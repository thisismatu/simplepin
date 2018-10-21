import queryString from 'query-string'

const server = 'https://api.pinboard.in/v1'

const loginUrl = (parameters) => `${server}/user/api_token/?${parameters}`

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

export const login = (token) => {
  const data = {
    'format': 'json',
    'auth_token': token
  }
  const params = queryString.stringify(data)
  return fetchWithErrorHandling(loginUrl(params))
}