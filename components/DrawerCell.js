import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/assets/Base'

const DrawerCell = (props) => {
  const isFocused = props.isFocused(props.route, props.title)
  return (
    <TouchableOpacity
      style={[styles.cell, isFocused && styles.active]}
      activeOpacity={0.7}
      onPress={props.navigateTo(props.route, props.title, isFocused)}
    >
      <Text style={styles.text}>{props.title}</Text>
      {
        props.count
        ? <Text style={styles.secondary}>{props.routeCount(props.count)}</Text>
        : null
      }
    </TouchableOpacity>
  )
}

DrawerCell.propTypes = {
  count: PropTypes.string,
  isFocused: PropTypes.func.isRequired,
  navigateTo: PropTypes.func.isRequired,
  route: PropTypes.string.isRequired,
  routeCount: PropTypes.func,
  title: PropTypes.string.isRequired,
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: Base.padding.medium,
  },
  active: {
    backgroundColor: Base.color.blue1,
  },
  text: {
    color: Base.color.gray4,
    fontSize: Base.font.large,
  },
  secondary: {
    color: Base.color.gray3,
    fontSize: Base.font.medium,
  },
})

export default DrawerCell
