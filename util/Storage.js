import {AsyncStorage} from 'react-native'

const keys = {
  apiToken: '@Simplepin:apiToken',
  updateTime: '@Simplepin:updateTime',
}

const apiToken = async () => await AsyncStorage.getItem(keys.apiToken)

const setApiToken = async (apiToken) => {
  await AsyncStorage.setItem(keys.apiToken, apiToken)
}

// Update time may not be needed after all…

const updateTime = async () => AsyncStorage.getItem(keys.updateTime)

const setUpdateTime = async (updateTime) => {
  await AsyncStorage.setItem(keys.updateTime, updateTime)
}

export default {
  apiToken, setApiToken,
  updateTime, setUpdateTime
}