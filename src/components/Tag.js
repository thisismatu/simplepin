import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import PropTypes from 'prop-types'
import startsWith from 'lodash/startsWith'
import { color, padding, font, line, radius, icons } from '../style/style'

const s = StyleSheet.create({
  tagContainer: {
    paddingHorizontal: padding.tiny,
    paddingVertical: padding.small,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    backgroundColor: color.blue1,
    borderRadius: radius.small,
    paddingHorizontal: padding.small,
  },
  tagText: {
    color: color.blue2,
    fontSize: font.small,
    lineHeight: line.small,
  },
  tagIcon: {
    resizeMode: 'contain',
    width: 12,
    height: 12,
    marginLeft: padding.tiny,
    tintColor: color.blue2,
  },
  privateTag: {
    backgroundColor: color.gray1,
  },
  privateTagText: {
    color: color.gray3,
  },
  privateTagIcon: {
    tintColor: color.gray3,
  },
})

export default class Tag extends React.PureComponent {
  render() {
    const { tag, onPress, icon, style } = this.props
    const isPrivate = startsWith(tag, '.')
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => onPress(tag)}
        style={[s.tagContainer, style]}
      >
        <View style={[s.tag, isPrivate && s.privateTag]}>
          <Text style={[s.tagText, isPrivate && s.privateTagText]}>{tag}</Text>
          {icon && <Image source={icons.closeSmall} style={[s.tagIcon, isPrivate && s.privateTagIcon]} />}
        </View>
      </TouchableOpacity>
    )
  }
}

Tag.propTypes = {
  tag: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  icon: PropTypes.bool,
  style: PropTypes.object,
}
