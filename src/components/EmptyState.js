import React from 'react'
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import PropTypes from 'prop-types'
import { color, padding, font, line, row } from '../style/style'

const isIOS = Platform.OS === 'ios'

export default class EmptyState extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { topOffset: 0 }
  }

  onLayout = evt => {
    if (this.state.topOffset) return // layout was already called
    this.setState({ topOffset: evt.nativeEvent.layout.y })
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
    const { icon, title, subtitle, action, paddingBottom } = this.props
    return (
      <View style={[s.empty, isIOS && { paddingBottom }]} onLayout={this.onLayout}>
        {!!icon && <Image source={icon} style={s.icon} />}
        <Text style={s.title}>{title}</Text>
        {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
        {!!action && this.renderAction()}
      </View>
    )
  }
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.number,
  action: PropTypes.func,
  actionText: PropTypes.string,
  paddingBottom: PropTypes.number,
}

EmptyState.defaultProps = {
  paddingBottom: 0,
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
  },
  subtitle: {
    color: color.gray3,
    fontSize: font.medium,
    marginTop: padding.small,
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
    lineHeight: row.medium,
  },
})