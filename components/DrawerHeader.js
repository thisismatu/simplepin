import React from 'react'
import { StyleSheet, Platform, View, Text, Image } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/style/Base'
import Icons from 'app/style/Icons'
import Strings from 'app/style/Strings'

const isAndroid = Platform.OS === 'android'

const DrawerHeader = (props) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image source={Icons.simplepin} style={styles.icon} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{Strings.common.simplepin}</Text>
        <Text style={styles.subtitle}>{Strings.settings.version} {props.version}</Text>
      </View>
    </View>
  )
}

DrawerHeader.propTypes = {
  version: PropTypes.string.isRequired,
}

const styles = StyleSheet.create({
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
    marginBottom: 2,
  },
  subtitle: {
    color: Base.color.gray2,
    fontSize: Base.font.small,
  },
})

export default DrawerHeader
