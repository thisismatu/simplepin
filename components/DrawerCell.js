import React from 'react'
import { StyleSheet, Text, Image, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/style/Base'

const DrawerCell = (props) => {
  const isFocused = props.isFocused(props.route, props.title)
  return (
    <TouchableOpacity
      style={[styles.cell, isFocused && styles.active]}
      activeOpacity={0.5}
      onPress={props.navigateTo(props.route, props.title, props.list, isFocused)}
    >
      <Image source={props.icon} style={styles.icon} />
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
  isFocused: PropTypes.func.isRequired,
  navigateTo: PropTypes.func.isRequired,
  route: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.number,
  count: PropTypes.string,
  list: PropTypes.string,
  routeCount: PropTypes.func,
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

export default DrawerCell
