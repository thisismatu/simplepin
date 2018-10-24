import React from 'react'
import {StyleSheet, FlatList, RefreshControl, AsyncStorage} from 'react-native'
import {fetchMockPosts, fetchUpdate} from 'app/Api'
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
  static navigationOptions = {
    title: strings.common.simplepin,
  }

  constructor(props) {
    super(props)
    this.state = {
      posts: [],
      refreshing: false,
    }
  }

  componentDidMount() {
    this.setState({refreshing: true})
    this.checkForUpdates()
  }

  checkForUpdates = async () => {
    const apiToken = await Storage.apiToken()
    fetchUpdate(apiToken)
      .then((response) => {
        if (response.ok == 0) {
          console.warn(response.error)
        } else {
          const updateTime = new Date(response.update_time)
          console.log(updateTime)
          if (updateTime !== new Date()) {
            console.log("new posts!")
            Storage.setUpdateTime(updateTime)
            return this.getPosts()
          }
          console.log("nothing new…")
          this.setState({refreshing: false})
        }
      })
  }

  getPosts = async () => {
    fetchMockPosts()
      .then((response) => {
        if(response.ok === 0) {
          console.warn(response.error)
        } else {
          const str = JSON.stringify(response)
          const obj = JSON.parse(str, reviver)
          this.setState({posts: obj, refreshing: false})
        }
      })
  }

  onRefresh = () => {
    this.setState({refreshing: true})
    this.checkForUpdates()
  }

  render() {
    return (
      <FlatList
        data={this.state.posts}
        initialNumToRender={8}
        keyExtractor={(item, index) => index.toString()}
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
  }
})