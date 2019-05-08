import React from 'react'
import { Image, StyleSheet, TouchableOpacity, Text } from 'react-native'
import PropTypes from 'prop-types'
import { color, font, padding } from 'app/style/style'

export default class NavigationButton extends React.PureComponent {
  render() {
    const { icon, text, onPress } = this.props
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={onPress}
        style={s.button}
        >
        {!!icon && <Image source={icon} style={s.icon} />}
        {!!text && <Text style={s.text}>{text}</Text>}
      </TouchableOpacity>
    )
  }
}

NavigationButton.propTypes = {
  onPress: PropTypes.func,
  icon: PropTypes.number,
  text: PropTypes.string,
}

const s = StyleSheet.create({
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  icon: {
    tintColor: color.blue2,
    marginHorizontal: 12,
    resizeMode: 'contain',
    height: 24,
    width: 24,
  },
  text: {
    color: color.blue2,
    fontSize: 16,
    fontWeight: font.bold,
    marginHorizontal: padding.medium,
    textAlign: 'right',
  },
})
