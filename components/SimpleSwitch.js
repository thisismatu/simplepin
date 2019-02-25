import React from 'react'
import { StyleSheet, Platform, Switch } from 'react-native'
import PropTypes from 'prop-types'
import { color, padding } from 'app/style/style'

const isAndroid = Platform.OS === 'android'

export default class SimpleSwitch extends React.PureComponent {
  render() {
    const { value, onValueChange } = this.props
    const track = isAndroid ? color.blue2 + '88' : color.blue2
    const thumb = isAndroid && value ? color.blue2 : null
    return (
      <Switch
        style={s.switch}
        thumbColor={thumb}
        trackColor={{ true: track }}
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
