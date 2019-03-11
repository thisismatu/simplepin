import React from 'react'
import { Text, NetInfo, StyleSheet, Animated } from 'react-native'
import { isIphoneX } from 'react-native-iphone-x-helper'
import { color, font, row } from 'app/style/style'
import strings from 'app/style/strings'

const height = isIphoneX() ? row.large : row.tiny

class OfflineNotification extends React.PureComponent {
  constructor() {
    super(...arguments)
    this.animation = new Animated.Value(0)
    this.containerStyle = StyleSheet.flatten([s.container, {
      transform: [{
        translateY: this.animation.interpolate({
          inputRange: [0, 1],
          outputRange: [height, 0],
          extrapolate: 'clamp',
        }),
      }],
    }])
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange)
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange)
  }

  handleConnectivityChange = isConnected => {
    Animated.timing(this.animation, {
      toValue: isConnected ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  render() {
    return (
      <Animated.View style={this.containerStyle}>
        <Text style={s.text}>{strings.error.appOffline}</Text>
      </Animated.View>
    )
  }
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    width: '100%',
    backgroundColor: color.blue2,
    height,
  },
  text: {
    color: color.white,
    fontSize: font.medium,
    textAlign: 'center',
    lineHeight: row.tiny,
  },
})

export default OfflineNotification
