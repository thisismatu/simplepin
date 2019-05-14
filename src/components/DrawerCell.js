import React from 'react'
import { StyleSheet, Image, Text, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import { color, padding, font, row } from '../style/style'

export default class DrawerCell extends React.PureComponent {
  render() {
    const { title, icon, count, isFocused, onPress } = this.props
    return (
      <TouchableOpacity
        style={[s.cell, isFocused && s.active]}
        activeOpacity={0.5}
        onPress={onPress}
        >
        <Image source={icon} style={s.icon} />
        <Text style={s.text}>{title}</Text>
        {!!count && <Text style={s.secondary}>{count}</Text>}
      </TouchableOpacity>
    )
  }
}

DrawerCell.propTypes = {
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  isFocused: PropTypes.bool,
  icon: PropTypes.number,
  count: PropTypes.number,
}

const s = StyleSheet.create({
  cell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: row.medium,
    paddingHorizontal: padding.medium,
  },
  active: {
    backgroundColor: color.blue1,
  },
  icon: {
    height: 24,
    tintColor: color.black36,
    width: 24,
    marginRight: padding.medium,
    resizeMode: 'contain',
  },
  text: {
    flexGrow: 1,
    color: color.gray4,
    fontSize: font.large,
  },
  secondary: {
    color: color.gray3,
    fontSize: font.medium,
  },
})
