import React from 'react'
import { Text, View } from 'react-native'
import colors from 'app/assets/colors'
import strings from 'app/assets/strings'

export default class WelcomeView extends React.Component {
  static navigationOptions = {
    title: `${strings.common.simplepin}`
  }

  render() {
    return (
      <View>
        <Text>List view</Text>
      </View>
    )
  }
}