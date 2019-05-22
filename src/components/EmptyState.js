import React from 'react'
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { getInset } from 'react-native-safe-area-view'
import PropTypes from 'prop-types'
import { color, padding, font, line, row } from '../style/style'

export default class EmptyState extends React.PureComponent {
  constructor(props) {
    super(props)
    this.rotateValue = new Animated.Value(0)
    this.rotateAnimation = Animated.loop(
      Animated.timing(this.rotateValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    )
    this.iconStyle = StyleSheet.flatten([s.icon, {
      transform: [{
        rotate: this.rotateValue.interpolate({
          inputRange: [0, 0.2, 0.8, 1],
          outputRange: ['0deg', '45deg', '315deg', '360deg'],
        }),
      }],
    }])
  }

  componentDidMount() {
    this.animate(this.props.rotateIcon)
  }

  componentWillUnmount() {
    this.animate(false)
  }

  animate = loading => {
    this.rotateValue.setValue(0)
    if (loading) {
      this.rotateAnimation.start()
    } else {
      this.rotateAnimation.stop()
    }
  }

  renderAction() {
    const { action, actionText } = this.props
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        style={s.button}
        onPress={action}
      >
        <Text style={s.buttonText}>{actionText}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    const { icon, title, subtitle, action, keyboardHeight, rotateIcon } = this.props
    const iconStyle = rotateIcon ? this.iconStyle : s.icon
    const bottomInset = getInset('bottom')
    const paddingBottom = keyboardHeight - Math.max(bottomInset, padding.large)
    return (
      <View style={[s.empty, {paddingBottom: paddingBottom}]}>
        {!!icon && <Animated.Image source={icon} style={iconStyle} />}
        {!!title && <Text style={s.title}>{title}</Text>}
        {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
        {!!action && this.renderAction()}
      </View>
    )
  }
}

EmptyState.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  icon: PropTypes.number,
  action: PropTypes.func,
  actionText: PropTypes.string,
  keyboardHeight: PropTypes.number,
  rotateIcon: PropTypes.bool,
}

EmptyState.defaultProps = {
  keyboardHeight: 0,
  rotateIcon: false,
}

const s = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: padding.large,
  },
  icon: {
    marginBottom: padding.medium,
    tintColor: color.black36,
    resizeMode: 'contain',
  },
  title: {
    color: color.gray4,
    fontSize: font.large,
    fontWeight: font.bold,
    textAlign: 'center',
    marginBottom: padding.small,
  },
  subtitle: {
    color: color.gray3,
    fontSize: font.medium,
    marginBottom: padding.small,
    lineHeight: line.medium,
    textAlign: 'center',
  },
  button: {
    backgroundColor: color.white,
    paddingHorizontal: padding.medium,
  },
  buttonText: {
    color: color.blue2,
    fontSize: font.medium,
    fontWeight: '500',
    lineHeight: row.small,
  },
})
