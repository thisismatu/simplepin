import AsyncStorage from '@react-native-community/async-storage'

const keys = {
  apiToken: '@Simplepin:apiToken',
  markAsRead: '@Simplepin:markAsRead',
  exactDate: '@Simplepin:exactDate',
  tagOrder: '@Simplepin:tagOrder',
  privateByDefault: '@Simplepin:privateByDefault',
  unreadByDefault: '@Simplepin:unreadByDefault',
  openLinksExternal: '@Simplepin:openLinksExternal',
  readerMode: '@Simplepin:readerMode',
}

const apiToken = async () => AsyncStorage.getItem(keys.apiToken)

const setApiToken = async value => {
  await AsyncStorage.setItem(keys.apiToken, value)
}

const markAsRead = async () => {
  const value = await AsyncStorage.getItem(keys.markAsRead)
  return !!JSON.parse(value)
}

const setMarkAsRead = async value => {
  const strValue = JSON.stringify(value)
  await AsyncStorage.setItem(keys.markAsRead, strValue)
}

const exactDate = async () => {
  const value = await AsyncStorage.getItem(keys.exactDate)
  return !!JSON.parse(value)
}

const setExactDate = async value => {
  const strValue = JSON.stringify(value)
  await AsyncStorage.setItem(keys.exactDate, strValue)
}

const tagOrder = async () => {
  const value = await AsyncStorage.getItem(keys.tagOrder)
  return !!JSON.parse(value)
}

const setTagOrder = async value => {
  const strValue = JSON.stringify(value)
  await AsyncStorage.setItem(keys.tagOrder, strValue)
}

const privateByDefault = async () => {
  const value = await AsyncStorage.getItem(keys.privateByDefault)
  return !!JSON.parse(value)
}

const setPrivateByDefault = async value => {
  const strValue = JSON.stringify(value)
  await AsyncStorage.setItem(keys.privateByDefault, strValue)
}

const unreadByDefault = async () => {
  const value = await AsyncStorage.getItem(keys.unreadByDefault)
  return !!JSON.parse(value)
}

const setUnreadByDefault = async value => {
  const strValue = JSON.stringify(value)
  await AsyncStorage.setItem(keys.unreadByDefault, strValue)
}

const openLinksExternal = async () => {
  const value = await AsyncStorage.getItem(keys.openLinksExternal)
  return !!JSON.parse(value)
}

const setOpenLinksExternal = async value => {
  const strValue = JSON.stringify(value)
  await AsyncStorage.setItem(keys.openLinksExternal, strValue)
}

const readerMode = async () => {
  const value = await AsyncStorage.getItem(keys.readerMode)
  return JSON.parse(value) !== false
}

const setReaderMode = async value => {
  const strValue = JSON.stringify(value)
  await AsyncStorage.setItem(keys.readerMode, strValue)
}

const userPreferences = async () => {
  return {
    apiToken: await apiToken(),
    exactDate: await exactDate(),
    markAsRead: await markAsRead(),
    tagOrder: await tagOrder(),
    privateByDefault: await privateByDefault(),
    unreadByDefault: await unreadByDefault(),
    openLinksExternal: await openLinksExternal(),
    readerMode: await readerMode(),
  }
}

const clear = async () => AsyncStorage.clear()

export default {
  apiToken,
  setApiToken,
  markAsRead,
  setMarkAsRead,
  exactDate,
  setExactDate,
  tagOrder,
  setTagOrder,
  privateByDefault,
  setPrivateByDefault,
  unreadByDefault,
  setUnreadByDefault,
  openLinksExternal,
  setOpenLinksExternal,
  readerMode,
  setReaderMode,
  userPreferences,
  clear,
}
