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
  let apiToken = token.trim();
  const url = `https://api.pinboard.in/v1/user/api_token/?format=json&auth_token=${apiToken}`;
  return fetchWithErrorHandling(url)
}