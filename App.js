import React from 'react'
import { StatusBar, Dimensions } from 'react-native'
import AppNavigator from 'app/views/AppNavigator'

export default class App extends React.Component {
  render() {
    const { width, height } = Dimensions.get('window')
    if (width > height) { StatusBar.setHidden(true) }
    return (
      <AppNavigator />
    )
  }
}
