import React from 'react'
import { StyleSheet, View } from 'react-native'
import PropTypes from 'prop-types'
import { color, padding } from 'app/style/style'

const Separator = ({ left, right, ...props }) => {
  return (
    <View
      style={{
        marginRight: right,
        marginLeft: left,
        borderBottomColor: color.black12,
        borderBottomWidth: StyleSheet.hairlineWidth,
      }}
      {...props}
    />
  )
}

Separator.propTypes = {
  left: PropTypes.number,
  right: PropTypes.number,
}

Separator.defaultProps = {
  left: padding.medium,
  right: padding.medium,
}

export default Separator
