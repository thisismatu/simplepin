import React from 'react'
import { StyleSheet, View } from 'react-native'
import PropTypes from 'prop-types'
import { color, padding } from 'app/style/style'

export default class Separator extends React.PureComponent {
  render() {
    return (
      <View
        style={{
          marginRight: this.props.right,
          marginLeft: this.props.left,
          borderBottomColor: color.black12,
          borderBottomWidth: StyleSheet.hairlineWidth,
        }}
      />
    )
  }
}

Separator.propTypes = {
  left: PropTypes.number,
  right: PropTypes.number,
}

Separator.defaultProps = {
  left: padding.medium,
  right: padding.medium,
}
