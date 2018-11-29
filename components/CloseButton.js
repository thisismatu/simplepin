import React from 'react'
import { StyleSheet, TouchableOpacity, Image } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/assets/Base'

const MenuButton = ({ navigation }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => navigation.dismiss()}
    >
      <Image source={require('app/assets/ic-close.png')} style={styles.menuButton} />
    </TouchableOpacity>
  )
}

MenuButton.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  menuButton: {
    marginHorizontal: 12,
    marginVertical: Base.padding.small,
    tintColor: Base.color.blue2,
  },
})

export default MenuButton
