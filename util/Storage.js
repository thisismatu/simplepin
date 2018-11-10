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

export default {
  apiToken, setApiToken
}
