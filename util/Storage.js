import { AsyncStorage } from 'react-native'

const keys = {
  apiToken: '@Simplepin:apiToken',
  markAsRead: '@Simplepin:markAsRead',
  exactDate: '@Simplepin:exactDate',
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

const exactDate = async () => {
  const value = await AsyncStorage.getItem(keys.exactDate)
  return JSON.parse(value)
}

const setExactDate = async (exactDate) => {
  const value = JSON.stringify(exactDate)
  await AsyncStorage.setItem(keys.exactDate, value)
}

export default {
  apiToken,
  setApiToken,
  markAsRead,
  setMarkAsRead,
  exactDate,
  setExactDate,
}
