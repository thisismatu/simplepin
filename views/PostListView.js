import React from 'react'
import {StyleSheet, FlatList, RefreshControl} from 'react-native'
import {moockPosts} from 'app/Api'
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
      return value != '' ? value.split(' ') : null
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
    setTimeout(() => {
      moockPosts()
        .then((response) => {
          this.setState({refreshing: false})
          if(response.ok == 0) {
            console.warn(response.error)
          } else {
            const str = JSON.stringify(response)
            const obj = JSON.parse(str, reviver)
            this.setState({posts: obj})
          }
        })
    }, 1000)
  }

  onRefresh = () => {
    this.setState({refreshing: true})
    setTimeout(() => {this.setState({refreshing: false})}, 2000)
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