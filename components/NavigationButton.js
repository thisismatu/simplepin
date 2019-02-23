import React from 'react'
import { StyleSheet, TouchableOpacity, Image, Text } from 'react-native'
import PropTypes from 'prop-types'
import { color, font } from 'app/style/style'

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
    resizeMode: 'center',
    height: '100%',
    width: 46,
  },
  text: {
    alignSelf: 'center',
    color: color.blue2,
    fontSize: 16,
    fontWeight: font.bold,
    marginHorizontal: 15,
  },
})
