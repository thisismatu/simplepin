import React from 'react'
import { StatusBar, View } from 'react-native'
import AppContainer from './Navigator'
import OfflineNotification from './components/OfflineNotification'

export default class App extends React.Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar
          backgroundColor="transparent"
          barStyle="dark-content"
          translucent={true}
        />
        <AppContainer />
        <OfflineNotification />
      </View>
    )
  }
}
