import React from 'react'
import { View, StatusBar } from 'react-native'
import AppNavigator from 'app/views/AppNavigator'

export default class App extends React.Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar
          animated={true}
          backgroundColor="transparent"
          barStyle="dark-content"
          translucent={true}
        />
        <AppNavigator />
      </View>
    )
  }
}
