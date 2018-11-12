import React from 'react'
import {StyleSheet, View} from 'react-native'
import Base from 'app/assets/Base'

const Separator = ({left = Base.padding.medium, right = Base.padding.medium}) => {
  return (
    <View
      style={{
        marginRight: right,
        marginLeft: left,
        borderBottomColor: Base.colors.border,
        borderBottomWidth: StyleSheet.hairlineWidth,
      }}
    />
  )
}

export default Separator
