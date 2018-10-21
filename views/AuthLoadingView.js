import React from 'react'
import { View, AsyncStorage } from 'react-native'

export default class AuthLoadingView extends React.Component {
  constructor(props) {
    super(props)
    this.bootstrapAsync()
  }

  bootstrapAsync = async () => {
    const apiToken = await AsyncStorage.getItem('apiToken')
    this.props.navigation.navigate(apiToken ? 'App' : 'Auth')
  }

  render() {
    return <View />
  }
}