import _ from 'lodash'
import React from 'react'
import {StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView} from 'react-native'
import Storage from 'app/util/Storage'
import {colors, padding, fonts} from 'app/assets/base'
import strings from 'app/assets/strings'

class DrawerItem extends React.Component {
  isRouteFocused = (route, param = null) => {
    const {state} = this.props.navigation
    const focusedRoute = _.get(state.routes[state.index], ['routes', '0', 'routeName'])
    const focusedParam = _.get(state.routes[state.index], ['routes', '0', 'params', 'title'])

    if (param) {
      return _.isEqual([route, param],[focusedRoute, focusedParam])
    }
    return _.isEqual(route, focusedRoute)
  }

  getRouteCount = (route, param) => {
    const {state} = this.props.navigation
    return _.get(state.routes, ['0', 'routes', '0', 'params', param])
  }

  navigateTo = (route, param) => {
    if (this.isRouteFocused(route,param)) {
      return this.props.navigation.closeDrawer()
    }
    this.props.navigation.closeDrawer()
    this.props.navigation.navigate(route, param && {title: param})
  }

  render() {
    const {route, text, secondary, param} = this.props
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

export default class DrawerView extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={styles.cell}>
              <Text style={styles.header}>{strings.menu.bookmarks}</Text>
            </View>
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
          </View>
          <View style={styles.section}>
            <View style={styles.cell}>
              <Text style={styles.header}>{strings.common.simplepin}</Text>
            </View>
            <DrawerItem
              route="Settings"
              text={strings.menu.settings}
              navigation={this.props.navigation}
            />
            <Text style={styles.version}>{strings.common.simplepin} v. XXXX</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  section: {
    paddingTop: padding.small,
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: padding.medium,
  },
  active: {
    backgroundColor: colors.blue1,
  },
  text: {
    color: colors.gray4,
    fontSize: fonts.large,
  },
  secondary: {
    color: colors.gray3,
    fontSize: fonts.medium,
  },
  header: {
    color: colors.gray4,
    fontSize: fonts.large,
    fontWeight: fonts.bold,
  },
  version: {
    fontSize: fonts.small,
    color: colors.gray3,
    paddingVertical: padding.large,
    paddingHorizontal: padding.medium,
  }
})
