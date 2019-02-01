import React from 'react'
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/style/Base'

export default class EmptyState extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = { topOffset: 0 }
  }

  onLayout = (event) => {
    if (this.state.topOffset) return // layout was already called
    this.setState({ topOffset: event.nativeEvent.layout.y })
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
    const { icon, title, subtitle, action } = this.props
    const offset = icon ? this.state.topOffset + 64 : this.state.topOffset
    return (
      <View style={[s.empty, { paddingBottom: offset }]} onLayout={this.onLayout}>
        { icon ? <Image source={icon} style={s.icon} /> : null }
        <Text style={s.title}>{title}</Text>
        { subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null }
        <View style={{ height: Base.row.medium }}>
          { action ? this.renderAction() : null }
        </View>
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

const s = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Base.padding.large,
  },
  icon: {
    marginBottom: Base.padding.medium,
    tintColor: Base.color.black36,
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
