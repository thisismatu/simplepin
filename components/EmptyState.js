import React from 'react'
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/style/Base'

export default class EmptyState extends React.PureComponent {
  renderAction() {
    const { action, actionText } = this.props
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.button}
        onPress={action}
      >
        <Text style={styles.buttonText}>{actionText}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    const { icon, title, subtitle, action } = this.props
    return (
      <View style={styles.empty}>
        { icon ? <Image source={icon} style={styles.icon} /> : null }
        <Text style={styles.title}>{title}</Text>
        { subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null }
        { action ? this.renderAction() : null }
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
}

const windowHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
  empty: {
    marginTop: Math.round(windowHeight / 6),
    alignItems: 'center',
    paddingHorizontal: Base.padding.large,
    paddingVertical: Base.padding.medium,
  },
  icon: {
    tintColor: Base.color.black36,
    marginBottom: Base.padding.medium,
  },
  title: {
    color: Base.color.gray4,
    fontSize: Base.font.large,
    fontWeight: Base.font.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: Base.color.gray3,
    fontSize: Base.font.medium,
    marginTop: Base.padding.small,
    lineHeight: Base.line.medium,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Base.color.white,
    paddingHorizontal: Base.padding.medium,
  },
  buttonText: {
    color: Base.color.blue2,
    fontSize: Base.font.medium,
    fontWeight: '500',
    lineHeight: Base.row.medium,
  },
})
