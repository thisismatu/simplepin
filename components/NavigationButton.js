import React from 'react'
import { StyleSheet, TouchableOpacity, Image, Text } from 'react-native'
import PropTypes from 'prop-types'
import { color, padding, font } from 'app/style/style'

export default class NavigationButton extends React.PureComponent {
  render() {
    const { icon, text } = this.props
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={this.props.onPress}
        style={s.button}
      >
        {!!icon && <Image source={icon} style={s.icon} />}
        {!!text && <Text style={s.text}>{text}</Text>}
      </TouchableOpacity>
    )
  }
}

NavigationButton.propTypes = {
  icon: PropTypes.number,
  text: PropTypes.string,
  onPress: PropTypes.func,
}

const s = StyleSheet.create({
  button: {
    padding: padding.small,
  },
  icon: {
    tintColor: color.blue2,
    resizeMode: 'contain',
    marginHorizontal: 4,
    width: 24,
    height: 24,
  },
  text: {
    color: color.blue2,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: font.bold,
    marginHorizontal: padding.small,
  },
})
