import React from 'react'
import {StyleSheet, TouchableOpacity, Image} from 'react-native'
import {colors} from 'app/assets/base'

export default class MenuButton extends React.PureComponent {
  render() {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => this.props.navigation.openDrawer()}
      >
        <Image source={require('app/assets/ic-menu.png')} style={styles.menuButton} />
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  menuButton: {
    marginHorizontal: 12,
    marginVertical: 8,
    tintColor: colors.blue2,
  }
})