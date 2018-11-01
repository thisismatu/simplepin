import _ from 'lodash'
import React from 'react'
import {StyleSheet, Text, Image, TouchableOpacity, ScrollView, SafeAreaView} from 'react-native'
import Storage from 'app/util/Storage'
import {colors, padding, fonts} from 'app/assets/base'
import strings from 'app/assets/strings'

const listSections = [
  {title: strings.menu.bookmarks, data: [strings.menu.all, strings.menu.unread, strings.menu.public, strings.menu.private]},
  {title: strings.common.simplepin, data: [strings.menu.settings, strings.menu.feedback, strings.menu.rate, strings.menu.logout]},
]

class DrawerItem extends React.PureComponent {
  isRouteFocused = (route) => {
    const {state} = this.props.navigation
    const focusedRoute = state.routes[state.index].key
    return route === focusedRoute
  }

  isRouteParamsFocused = (route, param) => {
    const {state} = this.props.navigation
    const focusedParams = state.routes[state.index].routes[0].params
    return this.isRouteFocused(route) && _.isEqual(param, focusedParams.title)
  }

  getRouteCount = (route, param) => {
    const {state} = this.props.navigation
    return state.routes[state.index].routes[0].params[param]
  }

  navigateTo = (route, param) => {
    if (this.isRouteFocused(route)) {
      this.props.navigation.closeDrawer()
    }
    this.props.navigation.navigate(route, {title: param})
  }

  render() {
    const {route, text, secondary, param} = this.props
    const isFocused = param ? this.isRouteParamsFocused(route, param) : this.isRouteFocused(route)
    const routeCount = this.getRouteCount(route, secondary)
    return (
      <TouchableOpacity
        style={[styles.item, isFocused && styles.activeItem]}
        activeOpacity={0.7}
        onPress={() => this.navigateTo(route, param)}
      >
        <Text style={styles.itemText}>{text}</Text>
        { routeCount
          ? <Text style={styles.itemSecondaryText}>{routeCount}</Text>
          : null
        }
      </TouchableOpacity>
    )
  }
}

export default class DrawerView extends React.Component {
  render() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={styles.container}
        >
          <Text style={styles.header}>{strings.menu.bookmarks}</Text>
          <DrawerItem
            route="List"
            param={strings.menu.all}
            text={strings.menu.all}
            secondary="allCount"
            navigation={this.props.navigation}
          />
          <DrawerItem
            route="List"
            param={strings.menu.unread}
            text={strings.menu.unread}
            secondary="unreadCount"
            navigation={this.props.navigation}
          />
          <DrawerItem
            route="List"
            param={strings.menu.private}
            text={strings.menu.private}
            secondary="privateCount"
            navigation={this.props.navigation}
          />
          <DrawerItem
            route="List"
            param={strings.menu.public}
            text={strings.menu.public}
            secondary="publicCount"
            navigation={this.props.navigation}
          />
          <Text style={styles.header}>{strings.common.simplepin}</Text>
          <DrawerItem
            route="Settings"
            text={strings.menu.settings}
            navigation={this.props.navigation}
          />
          <Text style={styles.version}>{strings.common.simplepin} v. XXXX</Text>
        </ScrollView>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: padding.medium,
  },
  activeItem: {
    backgroundColor: colors.blue1,
  },
  itemText: {
    color: colors.gray4,
    fontSize: fonts.large,
    lineHeight: 16,
  },
  itemSecondaryText: {
    color: colors.gray3,
    lineHeight: 16,
    fontSize: fonts.medium,
  },
  header: {
    color: colors.gray4,
    fontSize: fonts.large,
    fontWeight: fonts.bold,
    lineHeight: 16,
    padding: padding.medium,
    paddingTop: padding.large
  },
  version: {
    fontSize: fonts.small,
    color: colors.gray3,
    paddingVertical: padding.large,
    paddingHorizontal: padding.medium,
  }
})
