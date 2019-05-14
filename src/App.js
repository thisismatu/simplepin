import React from 'react'
import { StatusBar, View } from 'react-native'
import AppNavigator from './AppNavigator'
import OfflineNotification from './components/OfflineNotification'

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
        <OfflineNotification />
      </View>
    )
  }
}
