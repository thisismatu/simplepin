import React from 'react'
import { StyleSheet, View } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/style/Base'

const Separator = ({ left = Base.padding.medium, right = Base.padding.medium }) => {
  return (
    <View
      style={{
        marginRight: right,
        marginLeft: left,
        borderBottomColor: Base.color.black12,
        borderBottomWidth: StyleSheet.hairlineWidth,
      }}
    />
  )
}

Separator.propTypes = {
  left: PropTypes.number,
  right: PropTypes.number,
}

export default Separator
