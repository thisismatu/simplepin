import {AsyncStorage} from 'react-native'

const keys = {
  apiToken: '@Simplepin:apiToken',
  updateTime: '@Simplepin:updateTime',
  postCount: '@Simplepin:postCount',
}

const apiToken = async () => await AsyncStorage.getItem(keys.apiToken)

const setApiToken = async (apiToken) => {
  await AsyncStorage.setItem(keys.apiToken, apiToken)
}

const postCount = async () => JSON.parse(await AsyncStorage.getItem(keys.postCount))

const setPostCount = async (postCount) => {
  await AsyncStorage.setItem(keys.postCount, JSON.stringify(postCount))
}

// Update time may not be needed after all…

const updateTime = async () => AsyncStorage.getItem(keys.updateTime)

const setUpdateTime = async (updateTime) => {
  await AsyncStorage.setItem(keys.updateTime, updateTime)
}

export default {
  apiToken, setApiToken,
  postCount, setPostCount,
  updateTime, setUpdateTime
}