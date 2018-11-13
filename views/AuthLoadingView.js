import React from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'
import Storage from 'app/util/Storage'

export default class AuthLoadingView extends React.Component {
  constructor(props) {
    super(props)
    this.initialView()
  }

  async initialView() {
    const apiToken = await Storage.apiToken()
    this.props.navigation.navigate(apiToken ? 'App' : 'Auth')
  }

  render() {
    return <View />
  }
}

AuthLoadingView.propTypes = {
  navigation: PropTypes.object.isRequired,
}
