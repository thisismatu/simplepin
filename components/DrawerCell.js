import React from 'react'
import { StyleSheet, Text, Image, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/style/Base'

export default class DrawerCell extends React.PureComponent {
  render() {
    const { title, icon, count, isFocused } = this.props
    return (
      <TouchableOpacity
        style={[styles.cell, isFocused && styles.active]}
        activeOpacity={0.5}
        onPress={this.props.navigateTo}
      >
        <Image source={icon} style={styles.icon} />
        <Text style={styles.text}>{title}</Text>
        { count ? <Text style={styles.secondary}>{count}</Text> : null }
      </TouchableOpacity>
    )
  }
}

DrawerCell.propTypes = {
  isFocused: PropTypes.bool.isRequired,
  navigateTo: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.number,
  count: PropTypes.number,
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: Base.row.medium,
    paddingHorizontal: Base.padding.medium,
  },
  active: {
    backgroundColor: Base.color.blue1,
  },
  icon: {
    height: 24,
    tintColor: Base.color.black36,
    width: 24,
    marginRight: Base.padding.medium,
  },
  text: {
    flexGrow: 1,
    color: Base.color.gray4,
    fontSize: Base.font.large,
  },
  secondary: {
    color: Base.color.gray3,
    fontSize: Base.font.medium,
  },
})
