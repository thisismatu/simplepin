import React from 'react'
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Platform } from 'react-native'
import PropTypes from 'prop-types'
import { Constants } from 'expo'
import HeaderCell from 'app/components/HeaderCell'
import DrawerCell from 'app/components/DrawerCell'
import Base from 'app/assets/Base'
import Strings from 'app/assets/Strings'

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
          style={styles.scrollView}
        >
          <HeaderCell text={Strings.posts.title} />
          <DrawerCell
            route="Posts"
            param={Strings.posts.all}
            text={Strings.posts.all}
            secondary="allCount"
            navigation={this.props.navigation}
          />
          <DrawerCell
            route="Posts"
            param={Strings.posts.unread}
            text={Strings.posts.unread}
            secondary="unreadCount"
            navigation={this.props.navigation}
          />
          <DrawerCell
            route="Posts"
            param={Strings.posts.private}
            text={Strings.posts.private}
            secondary="privateCount"
            navigation={this.props.navigation}
          />
          <DrawerCell
            route="Posts"
            param={Strings.posts.public}
            text={Strings.posts.public}
            secondary="publicCount"
            navigation={this.props.navigation}
          />

          <HeaderCell text={Strings.common.simplepin} />
          <DrawerCell
            route="Settings"
            text={Strings.settings.title}
            navigation={this.props.navigation}
          />
        </ScrollView>
      </SafeAreaView>
    )
  }
}

DrawerView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    marginTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
  },
})
