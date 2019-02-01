import React from 'react'
import { StyleSheet, Platform, View, Text, Image } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/style/Base'
import Icons from 'app/style/Icons'
import Strings from 'app/style/Strings'

const isAndroid = Platform.OS === 'android'

export default class DrawerHeader extends React.PureComponent {
  render() {
    return (
      <View style={s.container}>
        <View style={s.iconContainer}>
          <Image source={Icons.simplepin} style={s.icon} />
        </View>
        <View style={s.textContainer}>
          <Text style={s.title}>{Strings.common.simplepin}</Text>
          { this.props.text ? <Text style={s.subtitle}>{this.props.text}</Text> : null }
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
    paddingBottom: Base.padding.tiny,
    paddingHorizontal: Base.padding.medium,
    paddingTop: isAndroid ? Base.padding.large : Base.padding.medium,
  },
  iconContainer: {
    backgroundColor: Base.color.blue2,
    borderRadius: 100,
    marginRight: Base.padding.medium,
    padding: 12,
  },
  icon:  {
    height: 32,
    tintColor: Base.color.white,
    width: 32,
  },
  title: {
    color: Base.color.gray5,
    fontSize: Base.font.huge,
    fontWeight: Base.font.bold,
  },
  subtitle: {
    marginTop: 2,
    color: Base.color.gray3,
    fontSize: Base.font.medium,
  },
})
