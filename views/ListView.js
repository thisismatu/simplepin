import React from 'react'
import {StyleSheet, FlatList, RefreshControl} from 'react-native'
import {colors} from 'app/assets/base'
import ListItemView from 'app/views/ListItemView'
import strings from 'app/assets/strings'

import {mockData} from 'app/mockData'

export default class WelcomeView extends React.Component {
  static navigationOptions = {
    title: strings.common.simplepin
  }

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
    }
  }

  onRefresh = () => {
    this.setState({refreshing: true})
    setTimeout(() => {this.setState({refreshing: false})}, 2000)
  }

  render() {
    return (
      <FlatList
        data={mockData}
        initialNumToRender={8}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => <ListItemView post={item} />}
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this.onRefresh}
          />
        }
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  }
})