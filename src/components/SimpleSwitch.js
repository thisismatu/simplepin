import React from 'react'
import { Platform, StyleSheet, Switch } from 'react-native'
import PropTypes from 'prop-types'
import { color, padding } from '../style/style'

const isIOS = Platform.OS === 'ios'
const isAndroid = Platform.OS === 'android'

export default class SimpleSwitch extends React.PureComponent {
  render() {
    const { value, onValueChange } = this.props
    return (
      <Switch
        style={s.switch}
        trackColor={{ true: isIOS && color.blue2 }}
        onValueChange={onValueChange}
        value={value}
      />
    )
  }
}

SimpleSwitch.propTypes = {
  value: PropTypes.bool.isRequired,
  onValueChange: PropTypes.func.isRequired,
}

const s = StyleSheet.create({
  switch: {
    marginRight: isAndroid ? 12 : padding.medium,
  },
})
