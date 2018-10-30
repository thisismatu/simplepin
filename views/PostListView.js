import React from 'react'
import {StyleSheet, FlatList, RefreshControl, AsyncStorage, TouchableOpacity, Image} from 'react-native'
import Api from 'app/Api'
import Storage from 'app/util/Storage'
import PostListItem from 'app/views/PostListItem'
import {colors} from 'app/assets/base'
import strings from 'app/assets/strings'

const reviver = (key, value) => {
  switch (key) {
    case 'shared':
      return value == 'yes'
    case 'toread':
      return value == 'yes'
    case 'time':
      return new Date(value)
    case 'tags':
      return value !== '' ? value.split(' ') : null
    default:
      return value
  }
}

export default class PostListView extends React.Component {
  static navigationOptions = ({navigation}) => {
    const type = navigation.getParam('type', 1)
    return {
      title: strings.menu.all +" "+ type,
      headerLeft: (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.openDrawer()}
        >
          <Image source={require('app/assets/ic-menu.png')} style={styles.menu} />
        </TouchableOpacity>
      )
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      posts: null,
      refreshing: false,
      lastUpdateTime: null,
    }
  }

  componentDidMount() {
    this.onRefresh()
  }

  onRefresh = async () => {
    this.setState({refreshing: true})
    const hasUpdates = await this.checkForUpdates()
    hasUpdates && await this.fetchPosts()
    this.setState({refreshing: false})
  }

  checkForUpdates = async () => {
    const apiToken = await Storage.apiToken()
    const response = await Api.update(apiToken)
    if (response.ok == 0) {
      console.warn(response.error)
    } else {
      if (response.update_time !== this.state.lastUpdateTime) {
        this.setState({'lastUpdateTime': response.update_time})
        return true
      }
      return false
    }
  }

  fetchPosts = async () => {
    const apiToken = await Storage.apiToken()
    const response = await Api.mockPosts(apiToken)
    if(response.ok === 0) {
      console.warn(response.error)
    } else {
      const str = JSON.stringify(response)
      const obj = JSON.parse(str, reviver)
      this.setState({posts: obj})
    }
  }

  render() {
    return (
      <FlatList
        data={this.state.posts}
        initialNumToRender={8}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={null}
        renderItem={({item}) => <PostListItem item={item} />}
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
  },
  menu: {
    marginHorizontal: 12,
    marginVertical: 8,
    tintColor: colors.blue2,
  }
})