import React from 'react'
import { StyleSheet, FlatList, RefreshControl, View, Alert } from 'react-native'
import PropTypes from 'prop-types'
import filter from 'lodash/filter'
import fromPairs from 'lodash/fromPairs'
import intersection from 'lodash/intersection'
import lodash from 'lodash/lodash'
import map from 'lodash/map'
import maxBy from 'lodash/maxBy'
import omit from 'lodash/omit'
import reject from 'lodash/reject'
import uniqBy from 'lodash/uniqBy'
import findIndex from 'lodash/findIndex'
import Api from 'app/Api'
import Storage from 'app/util/Storage'
import { reviver } from 'app/util/JsonUtils'
import { handleResponseError } from 'app/util/ErrorUtils'
import NavigationButton from 'app/components/NavigationButton'
import PostCell from 'app/components/PostCell'
import Separator from 'app/components/Separator'
import BottomSheet from 'app/components/BottomSheet'
import SearchBar from 'app/components/SearchBar'
import EmptyState from 'app/components/EmptyState'
import Base from 'app/style/Base'
import Strings from 'app/style/Strings'
import Icons from 'app/style/Icons'

const filterPosts = (obj) => {
  const unique = uniqBy(obj, 'hash')
  return {
    allPosts: unique,
    unreadPosts: filter(unique, ['toread', true]),
    privatePosts: filter(unique, ['shared', false]),
    publicPosts: filter(unique, ['shared', true]),
  }
}

const postsCount = (obj) => {
  return {
    allCount: obj.allPosts.length,
    unreadCount: obj.unreadPosts.length,
    privateCount: obj.privatePosts.length,
    publicCount: obj.publicPosts.length,
  }
}

export default class PostsView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', Strings.posts.all),
      headerLeft: <NavigationButton onPress={() => navigation.openDrawer()} icon={Icons.menu} />,
      headerRight: <NavigationButton onPress={() => navigation.navigate('Add', { onSubmit: navigation.getParam('onSubmit') })} icon={Icons.add} />,
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      apiToken: null,
      allPosts: null,
      unreadPosts: null,
      privatePosts: null,
      publicPosts: null,
      refreshing: false,
      lastUpdateTime: null,
      markAsRead: false,
      exactDate: false,
      tagOrder: false,
      modalVisible: false,
      selectedPost: {},
      isSearchActive: false,
      searchQuery: '',
      searchQueryCounts: null,
      searchResults: null,
      pinboardDown: false,
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({ onSubmit: this.onSubmitAddPost })
    Storage.userPreferences()
      .then((value) => this.setState(value))
      .then(() => this.onRefresh())
  }

  checkForUpdates = async () => {
    const response = await Api.postsUpdate(this.state.apiToken)
    if (response.ok === 0) {
      if ( response.error === 503) { this.setState({ pinboardDown: true }) }
      handleResponseError(response.error, this.props.navigation)
    } else if (response.update_time !== this.state.lastUpdateTime) {
      this.setState({ lastUpdateTime: response.update_time })
      return true
    }
    return false
  }

  fetchPosts = async () => {
    const response = await Api.postsAll(this.state.apiToken)
    if(response.ok === 0) {
      if ( response.error === 503) { this.setState({ pinboardDown: true }) }
      handleResponseError(response.error, this.props.navigation)
    } else {
      const str = JSON.stringify(response)
      const obj = JSON.parse(str, reviver)
      const newData = filterPosts(obj)
      const newDataCount = postsCount(newData)
      this.setState({ ...newData, searchResults: this.currentList(true) })
      this.props.navigation.setParams(newDataCount)
    }
  }

  addPost = async (post) => {
    const index = findIndex(this.state.allPosts, ['hash', post.hash])
    const newCollection = this.state.allPosts
    if (index === -1) {
      newCollection.unshift(post)
    } else {
      newCollection[index] = post
    }
    const newData = filterPosts(newCollection)
    const newDataCount = postsCount(newData)
    this.setState({ ...newData, searchResults: this.currentList(true) })
    this.props.navigation.setParams(newDataCount)
    const response = await Api.postsAdd(post, this.state.apiToken)
    if(response.ok === 0) {
      if ( response.error === 503) { this.setState({ pinboardDown: true }) }
      handleResponseError(response.error, this.props.navigation)
    }
  }

  deletePost = async (post) => {
    const newCollection = reject(this.state.allPosts, { href: post.href })
    const newData = filterPosts(newCollection)
    const newDataCount = postsCount(newData)
    this.setState({ ...newData, searchResults: this.currentList(true) })
    this.props.navigation.setParams(newDataCount)
    const response = await Api.postsDelete(post, this.state.apiToken)
    if(response.ok === 0) {
      if ( response.error === 503) { this.setState({ pinboardDown: true }) }
      handleResponseError(response.error, this.props.navigation)
    }
  }

  filterSearchResults = (text, tags = false) => {
    return filter(this.currentList(), post => {
      const tagData = post.tags ? post.tags.join(' ').toLowerCase() : ''
      const postData = `
        ${post.description.toLowerCase()}
        ${post.extended.toLowerCase()}
        ${post.tags ? post.tags.join(' ').toLowerCase() : ''}
      `
      const returnData = tags ? tagData : postData
      return returnData.includes(text.toLocaleString())
    })
  }

  similarSearchResults = () => {
    const { searchQueryCounts } = this.state
    const similarQuery = maxBy(Object.keys(searchQueryCounts), o => searchQueryCounts[o])
    const similarResults = this.filterSearchResults(similarQuery)
    return {
      searchResults: similarResults,
      searchQuery: similarQuery,
    }
  }

  currentList = (shouldFilter) => {
    const current = this.props.navigation.getParam('list', 'allPosts')
    if (shouldFilter) {
      return this.filterSearchResults(this.state.searchQuery)
    }
    return this.state[current]
  }

  toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible })
  }

  onRefresh = async () => {
    this.setState({ refreshing: true })
    const hasUpdates = await this.checkForUpdates()
    if (hasUpdates) {
      await this.fetchPosts()
    }
    this.setState({ refreshing: false })
  }

  onSearchChange = (evt, tags) => {
    const searchQuery = evt.nativeEvent ? evt.nativeEvent.text : evt
    const searchQueryArray = searchQuery.toLowerCase().split(' ')
    this.setState({
      searchQuery: searchQuery,
      isSearchActive: searchQuery === '' ? false : true,
    })
    const allResults = map(searchQueryArray, text => this.filterSearchResults(text, tags))
    const queryCounts = lodash(allResults)
      .map((res, i) => [searchQueryArray[i], res.length])
      .fromPairs()
      .omit('')
      .value()
    const uniqueResults = intersection(...allResults)
    this.setState({
      searchResults: uniqueResults,
      searchQueryCounts: queryCounts,
    })
  }

  onShowSimilarResults = () => {
    const similarResults = this.similarSearchResults()
    if (similarResults.searchResults.length > 0) {
      this.setState(similarResults)
    }
  }

  onTagPress = tag => () => {
    this.onSearchChange(tag, true)
    this.flatList.scrollToOffset({ offset: 0, animated: false })
  }

  onCellPress = post => () => {
    this.props.navigation.navigate('Browser', { title: post.description, url: post.href })
    if (this.state.markAsRead && post.toread) {
      post.toread = !post.toread
      post.meta = Math.random().toString(36) // PostCell change detection
      this.addPost(post)
    }
  }

  onCellLongPress = post => () => {
    this.toggleModal()
    this.setState({ selectedPost: post })
  }

  onToggleToread = post => () => {
    this.toggleModal()
    post.toread = !post.toread
    post.meta = Math.random().toString(36) // PostCell change detection
    this.addPost(post)
  }

  onSubmitAddPost = (post) => {
    this.addPost(post)
  }

  onEditPost = post => () => {
    const { navigation } = this.props
    this.toggleModal()
    navigation.navigate('Add', { post: post, onSubmit: navigation.getParam('onSubmit') })
  }

  onDeletePost = post => () => {
    Alert.alert(
      Strings.common.deletePost,
      post.description,
      [
        { text: Strings.common.cancel, style: 'cancel' },
        { text: Strings.common.delete,
          onPress: () => {
            this.toggleModal()
            this.deletePost(post)
          },
          style: 'destructive',
        },
      ]
    )
  }

  renderListHeader = () => {
    if (!this.currentList()) { return null }
    return (
      <SearchBar
        isSearchActive={this.state.isSearchActive}
        searchQuery={this.state.searchQuery}
        onSearchChange={this.onSearchChange}
        count={this.state.searchResults.length}
      />
    )
  }

  renderPostCell = (item) => {
    return (
      <PostCell
        post={item}
        changeDetection={item.meta}
        onTagPress={this.onTagPress}
        onCellPress={this.onCellPress}
        onCellLongPress={this.onCellLongPress}
        exactDate={this.state.exactDate}
        tagOrder={this.state.tagOrder}
      />
    )
  }

  renderRefreshControl = () => {
    return (
      <RefreshControl
        refreshing={this.state.refreshing}
        onRefresh={this.onRefresh}
      />
    )
  }

  renderEmptyState = () => {
    const { apiToken, allPosts, refreshing, pinboardDown, isSearchActive, searchQuery } = this.state
    if (!apiToken) { return null }
    if (isSearchActive) {
      const similarResults = this.similarSearchResults()
      return <EmptyState
        action={ similarResults.searchResults.length > 0 ? this.onShowSimilarResults : undefined }
        actionText={`Show results for “${similarResults.searchQuery}”`}
        icon={Icons.searchLarge}
        subtitle={`“${searchQuery}“`}
        title={Strings.common.noResults} />
    }
    if (pinboardDown) {
      return <EmptyState
        action={this.onRefresh}
        actionText={Strings.common.tryAgain}
        icon={Icons.offlineLarge}
        subtitle={Strings.error.pinboardDown}
        title={Strings.error.troubleConnecting} />
    }
    if (!allPosts && !refreshing) {
      const { navigation } = this.props
      return <EmptyState
        action={() => navigation.navigate('Add', { onSubmit: navigation.getParam('onSubmit') })}
        actionText={Strings.add.titleAdd}
        icon={Icons.simplepin}
        subtitle={Strings.common.noPostsMessage}
        title={Strings.common.noPosts} />
    }
    return null
  }

  render() {
    const data = this.state.isSearchActive ? this.state.searchResults : this.currentList()
    const hasData = data && data.length
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          ref={(ref) => this.flatList = ref}
          contentContainerStyle={[styles.container, !hasData && { flex: 1 }]}
          data={data}
          initialNumToRender={8}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => this.renderPostCell(item)}
          refreshControl={this.renderRefreshControl()}
          style={styles.list}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          ItemSeparatorComponent={() => <Separator left={Base.padding.large} />}
          ListEmptyComponent={this.renderEmptyState()}
          ListHeaderComponent={this.renderListHeader()}
        />
        <BottomSheet
          modalVisible={this.state.modalVisible}
          onClose={this.toggleModal}
          onToggleToread={this.onToggleToread}
          onEditPost={this.onEditPost}
          onDeletePost={this.onDeletePost}
          post={this.state.selectedPost}
        />
      </View>
    )
  }
}

PostsView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  container : {
    paddingTop: Base.padding.medium,
    paddingBottom: Base.padding.large,
  },
  list: {
    backgroundColor: Base.color.white,
  },
})
