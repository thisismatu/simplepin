import { AsyncStorage } from 'react-native'

const keys = {
  apiToken: '@Simplepin:apiToken',
  markAsRead: '@Simplepin:markAsRead',
}

const apiToken = async () => await AsyncStorage.getItem(keys.apiToken)

const setApiToken = async (apiToken) => {
  await AsyncStorage.setItem(keys.apiToken, apiToken)
}

const markAsRead = async () => {
  const value = await AsyncStorage.getItem(keys.markAsRead)
  return JSON.parse(value)
}

const setMarkAsRead = async (markAsRead) => {
  const value = JSON.stringify(markAsRead)
  await AsyncStorage.setItem(keys.markAsRead, value)
}

export default {
  apiToken,
  setApiToken,
  markAsRead,
  setMarkAsRead,
}
