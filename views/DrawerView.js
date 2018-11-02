import _ from 'lodash'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, ScrollView, SafeAreaView} from 'react-native'
import Storage from 'app/util/Storage'
import {colors, padding, fonts} from 'app/assets/base'
import strings from 'app/assets/strings'


class DrawerItem extends React.Component {
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
    return (
      <TouchableOpacity
        style={[styles.cell, isFocused && styles.active]}
        activeOpacity={0.7}
        onPress={() => this.navigateTo(route, param)}
      >
        <Text style={styles.text}>{text}</Text>
        {
          secondary
          ? <Text style={styles.secondary}>{secondary}</Text>
          : null
        }
      </TouchableOpacity>
    )
  }
}

export default class DrawerView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {postCount: {}}
  }

  getPostCounts = async () => {
    const postCount = await Storage.postCount()
    if (!_.isEqual(this.state.postCount, postCount)) {
      this.setState({'postCount': postCount})
    }
  }

  render() {
    this.props.navigation.addListener('willFocus', () => this.getPostCounts())
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
            secondary={this.state.postCount.all}
            navigation={this.props.navigation}
          />
          <DrawerItem
            route="List"
            param={strings.menu.unread}
            text={strings.menu.unread}
            secondary={this.state.postCount.unread}
            navigation={this.props.navigation}
          />
          <DrawerItem
            route="List"
            param={strings.menu.private}
            text={strings.menu.private}
            secondary={this.state.postCount.private}
            navigation={this.props.navigation}
          />
          <DrawerItem
            route="List"
            param={strings.menu.public}
            text={strings.menu.public}
            secondary={this.state.postCount.public}
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
  cell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: padding.medium,
    paddingVertical: 14,
  },
  active: {
    backgroundColor: colors.blue1,
  },
  text: {
    color: colors.gray4,
    fontSize: fonts.large,
    lineHeight: 20,
  },
  secondary: {
    color: colors.gray3,
    lineHeight: 20,
    fontSize: fonts.medium,
  },
  header: {
    color: colors.gray4,
    fontSize: fonts.large,
    fontWeight: fonts.bold,
    lineHeight: 20,
    paddingHorizontal: padding.medium,
    paddingVertical: 14,
  },
  version: {
    fontSize: fonts.small,
    color: colors.gray3,
    paddingVertical: padding.large,
    paddingHorizontal: padding.medium,
  }
})
