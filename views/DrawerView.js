import _ from 'lodash'
import React from 'react'
import {StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Platform} from 'react-native'
import {Constants} from 'expo'
import Base from 'app/assets/Base'
import Strings from 'app/assets/Strings'

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
          style={Platform.OS === 'android' && styles.scrollView}
        >
          <View style={styles.section}>
            <View style={styles.cell}>
              <Text style={styles.header}>{Strings.list.bookmarks}</Text>
            </View>
            <DrawerItem
              route="List"
              param={Strings.list.all}
              text={Strings.list.all}
              secondary="allCount"
              navigation={this.props.navigation}
            />
            <DrawerItem
              route="List"
              param={Strings.list.unread}
              text={Strings.list.unread}
              secondary="unreadCount"
              navigation={this.props.navigation}
            />
            <DrawerItem
              route="List"
              param={Strings.list.private}
              text={Strings.list.private}
              secondary="privateCount"
              navigation={this.props.navigation}
            />
            <DrawerItem
              route="List"
              param={Strings.list.public}
              text={Strings.list.public}
              secondary="publicCount"
              navigation={this.props.navigation}
            />
          </View>
          <View style={styles.section}>
            <View style={styles.cell}>
              <Text style={styles.header}>{Strings.common.simplepin}</Text>
            </View>
            <DrawerItem
              route="Settings"
              text={Strings.settings.title}
              navigation={this.props.navigation}
            />
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
  scrollView: {
    marginTop: Constants.statusBarHeight,
  },
  section: {
    paddingTop: Base.padding.small,
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: Base.padding.medium,
  },
  active: {
    backgroundColor: Base.colors.blue1,
  },
  text: {
    color: Base.colors.gray4,
    fontSize: Base.fonts.large,
  },
  secondary: {
    color: Base.colors.gray3,
    fontSize: Base.fonts.medium,
  },
  header: {
    color: Base.colors.gray4,
    fontSize: Base.fonts.large,
    fontWeight: Base.fonts.bold,
  },
})
