import React from 'react'
import { StatusBar, View } from 'react-native'
import AppNavigator from 'app/views/AppNavigator'
import OfflineNotification from 'app/components/OfflineNotification'

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
