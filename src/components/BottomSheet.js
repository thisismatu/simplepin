import React from 'react'
import { Animated, Dimensions, Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { getBottomSpace } from 'react-native-iphone-x-helper'
import PropTypes from 'prop-types'
import { color, padding, font, row, radius, shadow, isLandscape } from '../style/style'

const dimensions = Dimensions.get('screen')
const portraitWidth = Math.min(dimensions.width, dimensions.height)
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

const ModalTitle = ({ title }) => {
  const cellHeight = { height: isLandscape() ? row.medium : row.large }
  return (
    <View style={[s.cell, cellHeight]}>
      <Text
        style={s.title}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    </View>
  )
}

ModalTitle.propTypes = { title: PropTypes.string }

const ModalOption = ({ title, onPress }) => {
  const cellHeight = { height: isLandscape() ? row.medium : row.large }
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={[s.cell, cellHeight]}
      onPress={onPress}
    >
      <Text style={s.text}>{title}</Text>
    </TouchableOpacity>
  )
}

ModalOption.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
}

class BottomSheet extends React.PureComponent {
  constructor() {
    super(...arguments)
    this.state = { visible: this.props.visible }
    this.animation = new Animated.Value(0)
    this.overlayStyle = StyleSheet.flatten([s.overlay, { opacity: this.animation }])
    this.contentStyle = StyleSheet.flatten([s.content, {
      transform: [{
        translateY: this.animation.interpolate({
          inputRange: [0, 1],
          outputRange: [dimensions.height, 0],
          extrapolate: 'clamp',
        }),
      }],
    }])
    if (this.props.visible) this.animate(1)
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.visible && this.props.visible) {
      this.setState({ visible: true }, () => { // eslint-disable-line react/no-did-update-set-state
        this.animate(1)
      })
    } else if (prevProps.visible && !this.props.visible) {
      this.animate(0, () => {
        this.setState({ visible: false })
      })
    }
  }

  animate = (toValue, callback) => {
    Animated.timing(this.animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(callback)
  }

  render() {
    return (
      <Modal
        animationType="none"
        visible={this.state.visible}
        transparent={true}
        onRequestClose={this.props.onClose}
        hardwareAccelerated={true}
        supportedOrientations={['portrait', 'landscape']}
      >
        <StatusBar backgroundColor={color.black36} />
        <View style={s.root}>
          <AnimatedTouchableOpacity
            activeOpacity={1}
            onPress={this.props.onClose}
            style={this.overlayStyle}
          />
          <Animated.View style={this.contentStyle}>
            {this.props.children}
          </Animated.View>
        </View>
      </Modal>
    )
  }
}

BottomSheet.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: color.black36,
  },
  content: {
    width: portraitWidth,
    flexDirection: 'column',
    backgroundColor: color.white,
    borderTopLeftRadius: radius.large,
    borderTopRightRadius: radius.large,
    paddingBottom: Math.max(getBottomSpace(), padding.small),
    paddingTop: padding.small,
    ...shadow,
  },
  cell: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: padding.medium,
  },
  text: {
    color: color.gray4,
    fontSize: font.large,
  },
  title: {
    color: color.gray3,
    fontSize: font.medium,
    marginTop: padding.tiny,
  },
})

BottomSheet.Title = ModalTitle
BottomSheet.Option = ModalOption
export default BottomSheet
