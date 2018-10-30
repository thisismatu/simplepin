import React from 'react'
import {StyleSheet, Text, Image, TouchableOpacity, ScrollView, SafeAreaView} from 'react-native'
import Storage from 'app/util/Storage'
import {colors, padding, fonts} from 'app/assets/base'
import strings from 'app/assets/strings'

const listSections = [
  {title: strings.menu.bookmarks, data: [strings.menu.all, strings.menu.unread, strings.menu.public, strings.menu.private]},
  {title: strings.common.simplepin, data: [strings.menu.settings, strings.menu.feedback, strings.menu.rate, strings.menu.logout]},
]

class DrawerItem extends React.Component {
  isRouteFocused = (route) => {
    const { state } = this.props.navigation
    const focusedRoute = state.routes[state.index].key
    return route === focusedRoute
  }

  navigateTo = (route) => {
    if (this.isRouteFocused(route)) {
      this.props.navigation.closeDrawer()
    }
    this.props.navigation.navigate(route)
  }

  render() {
    const { route, text, secondary } = this.props
    return (
      <TouchableOpacity
        style={[styles.item, this.isRouteFocused(route) && styles.activeItem]}
        activeOpacity={0.7}
        onPress={() => this.navigateTo(route)}
      >
        <Text style={styles.itemText}>{text}</Text>
        { secondary
          ? <Text style={styles.itemSecondaryText}>{secondary}</Text>
          : null
        }
      </TouchableOpacity>
    )
  }
}

export default class MenuView extends React.Component {
  static navigationOptions = {
    title: strings.common.simplepin,
  }

  constructor(props) {
    super(props)
  }

  findRouteNameFromNavigatorState ({ routes }) {
    let route = routes[routes.length - 1];
    while (route.index !== undefined) route = route.routes[route.index];
    console.log(route.routeName)
    return route.routeName;
  }

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
            route={'List'}
            text={strings.menu.all}
            secondary={263}
            navigation={this.props.navigation}
          />

          <Text style={styles.header}>{strings.common.simplepin}</Text>

          <DrawerItem
            route={'Settings'}
            text={strings.menu.settings}
            secondary={263}
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