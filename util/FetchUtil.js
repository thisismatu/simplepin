export const handleResponse = (response, text) => {
  if (!response.ok) {
    console.warn(response.status)
    return Promise.resolve({ ok: 0, error: response.status })
  }
  return text ? response.text() : response.json()
}

export const fetchWithErrorHandling = (url, text = false) => {
  return fetch(url)
    .catch(e => ({ ok: 0, error: e }))
    .then(response => handleResponse(response, text))
}
