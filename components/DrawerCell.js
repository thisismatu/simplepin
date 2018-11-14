import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import Base from 'app/assets/Base'

export default class DrawerCell extends React.Component {
  isRouteFocused(route, param = null) {
    const { state } = this.props.navigation
    const focusedRoute = get(state.routes[state.index], ['routes', '0', 'routeName'])
    const focusedParam = get(state.routes[state.index], ['routes', '0', 'params', 'title'])

    if (param) {
      return isEqual([route, param],[focusedRoute, focusedParam])
    }
    return isEqual(route, focusedRoute)
  }

  getRouteCount(route, param) {
    const { state } = this.props.navigation
    return get(state.routes, ['0', 'routes', '0', 'params', param])
  }

  navigateTo(route, param) {
    if (this.isRouteFocused(route,param)) {
      return this.props.navigation.closeDrawer()
    }
    this.props.navigation.closeDrawer()
    this.props.navigation.navigate(route, param && { title: param })
  }

  render() {
    const { route, text, secondary, param } = this.props
    return (
      <TouchableOpacity
        style={[styles.cell, this.isRouteFocused(route, param) && styles.active]}
        activeOpacity={0.7}
        onPress={() => this.navigateTo(route, param)}
      >
        <Text style={styles.text}>{text}</Text>
        {
          secondary
          ? <Text style={styles.secondary}>{this.getRouteCount(route, secondary)}</Text>
          : null
        }
      </TouchableOpacity>
    )
  }
}

DrawerCell.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  secondary: PropTypes.string,
  param: PropTypes.string,
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
