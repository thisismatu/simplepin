import React from 'react'
import { StyleSheet, TouchableOpacity, Image } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/style/Base'
import Icons from 'app/style/Icons'

const NavigationButton = (props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={props.onPress}
    >
      <Image source={props.icon} style={styles.menuButton} />
    </TouchableOpacity>
  )
}

NavigationButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  icon: PropTypes.number.isRequired,
}

const styles = StyleSheet.create({
  menuButton: {
    marginHorizontal: 12,
    marginVertical: Base.padding.small,
    tintColor: Base.color.blue2,
  },
})

export default NavigationButton
