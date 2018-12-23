import React from 'react'
import { StyleSheet, View } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/style/Base'

export default class Separator extends React.PureComponent {
  render() {
    return (
      <View
        style={{
          marginRight: this.props.right,
          marginLeft: this.props.left,
          borderBottomColor: Base.color.black12,
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
