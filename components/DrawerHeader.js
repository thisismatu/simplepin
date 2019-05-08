import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import PropTypes from 'prop-types'
import { color, padding, font, icons } from 'app/style/style'
import strings from 'app/style/strings'

export default class DrawerHeader extends React.PureComponent {
  render() {
    const { text } = this.props
    return (
      <View style={s.container}>
        <View style={s.iconContainer}>
          <Image source={icons.simplepin} style={s.icon} />
        </View>
        <View style={s.textContainer}>
          <Text style={s.title}>{strings.common.simplepin}</Text>
          {!!text && <Text style={s.subtitle}>{text}</Text>}
        </View>
      </View>
    )
  }
}

DrawerHeader.propTypes = {
  text: PropTypes.string,
}

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    paddingBottom: padding.tiny,
    paddingHorizontal: padding.medium,
    paddingTop: padding.large,
  },
  iconContainer: {
    backgroundColor: color.blue2,
    borderRadius: 100,
    marginRight: padding.medium,
    padding: 12,
  },
  icon:  {
    height: 32,
    tintColor: color.white,
    width: 32,
    resizeMode: 'contain',
  },
  title: {
    color: color.gray5,
    fontSize: font.huge,
    fontWeight: font.bold,
  },
  subtitle: {
    marginTop: 2,
    color: color.gray3,
    fontSize: font.medium,
  },
})
