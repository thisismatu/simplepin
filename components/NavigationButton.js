import React from 'react'
import { StyleSheet, TouchableOpacity, Image } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/style/Base'

export default class NavigationButton extends React.PureComponent {
  render() {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={this.props.onPress}
      >
        <Image source={this.props.icon} style={styles.menuButton} />
      </TouchableOpacity>
    )
  }
}

NavigationButton.propTypes = {
  icon: PropTypes.number.isRequired,
  onPress: PropTypes.func,
}

const styles = StyleSheet.create({
  menuButton: {
    marginHorizontal: 12,
    marginVertical: Base.padding.small,
    tintColor: Base.color.blue2,
  },
})
