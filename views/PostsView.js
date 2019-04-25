import React from 'react'
import { StyleSheet, FlatList, RefreshControl, Alert, Linking, Vibration, Keyboard, NetInfo } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import PropTypes from 'prop-types'
import rssParser from 'react-native-rss-parser'
import filter from 'lodash/filter'
import fromPairs from 'lodash/fromPairs' // eslint-disable-line no-unused-vars
import omit from 'lodash/omit' // eslint-disable-line no-unused-vars
import intersection from 'lodash/intersection'
import lodash from 'lodash/lodash'
import map from 'lodash/map'
import maxBy from 'lodash/maxBy'
import reject from 'lodash/reject'
import uniqBy from 'lodash/uniqBy'
import findIndex from 'lodash/findIndex'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import Api from 'app/Api'
import Storage from 'app/Storage'
import { reviver } from 'app/util/JsonUtil'
import { handleResponseError } from 'app/util/ErrorUtil'
import { openShareDialog } from 'app/util/ShareUtil'
import NavigationButton from 'app/components/NavigationButton'
import PostCell from 'app/components/PostCell'
import Separator from 'app/components/Separator'
import BottomSheet from 'app/components/BottomSheet'
import SearchBar from 'app/components/SearchBar'
import EmptyState from 'app/components/EmptyState'
import { color, padding, icons } from 'app/style/style'
import strings from 'app/style/strings'

const filterPosts = obj => {
  return {
    allPosts: obj,
    unreadPosts: filter(obj, ['toread', true]),
    privatePosts: filter(obj, ['shared', false]),
    publicPosts: filter(obj, ['shared', true]),
    starredPosts: filter(obj, ['starred', true]),
  }
}

const postsCount = obj => {
  return {
    allCount: obj.allPosts.length,
    unreadCount: obj.unreadPosts.length,
    privateCount: obj.privatePosts.length,
    publicCount: obj.publicPosts.length,
    starredCount: obj.starredPosts.length,
  }
}

export default class PostsView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', strings.posts.all),
      headerLeft: <NavigationButton onPress={navigation.getParam('openDrawer')} icon={icons.menu} />,
      headerRight: <NavigationButton onPress={() => navigation.navigate('Add', { onSubmit: navigation.getParam('onSubmit') })} icon={icons.add} />,
    }
  }

  constructor(props) {
    super(props)
    this.keyboardHeight = 0
    this.isConnected = true
    this.searchQueryCounts = [],
    this.lastUpdateTime = null,
    this.state = {
      isLoading: false,
      allPosts: [],
      unreadPosts: [],
      privatePosts: [],
      publicPosts: [],
      modalVisible: false,
      selectedPost: {},
      isSearchActive: false,
      searchQuery: '',
      searchResults: [],
      pinboardDown: false,
      preferences: {
        apiToken: null,
        exactDate: false,
        markAsRead: false,
        tagOrder: false,
        openLinksExternal: true,
      },
    }
  }

  componentDidMount() {
    const { navigation } = this.props
    navigation.setParams({ onSubmit: this.onSubmitAddPost })
    navigation.setParams({ openDrawer: this.openDrawer })
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
    Storage.userPreferences()
      .then(prefs => this.setState({ preferences: prefs }))
      .then(() => this.onRefresh())
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange)
  }

  componentDidUpdate(prevProps, prevState) {
    Storage.userPreferences().then(prefs => {
      if (!isEqual(prevState.preferences, prefs)) {
        this.setState({ preferences: prefs })
      }
    })
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange)
  }

  keyboardDidShow = evt => {
    this.keyboardHeight = evt && evt.endCoordinates.height
  }

  keyboardDidHide = evt => {
    this.keyboardHeight = evt && evt.endCoordinates.height
  }

  handleConnectivityChange = isConnected => {
    this.isConnected = isConnected
  }

  checkForUpdates = async () => {
    const { preferences } = this.state
    const response = await Api.postsUpdate(preferences.apiToken)
    if (response.ok === 0) {
      if ( response.error === 503) { this.setState({ pinboardDown: true }) }
      handleResponseError(response.error, this.props.navigation)
    } else if (response.update_time !== this.lastUpdateTime) {
      this.lastUpdateTime = response.update_time
      return true
    }
    return false
  }

  fetchPosts = async () => {
    const { apiToken } = this.state.preferences
    const response = await Api.postsAll(apiToken)
    const secret = await Api.userSecret(apiToken)
    const starred = await Api.postsStarred(secret.result, apiToken)
    if(response.ok === 0) {
      if ( response.error === 503) { this.setState({ pinboardDown: true }) }
      handleResponseError(response.error, this.props.navigation)
    } else if (secret.ok === 0 || starred.ok === 0) {
      const jsonString = JSON.stringify(response)
      const jsonObject = JSON.parse(jsonString, reviver)
      const newData = filterPosts(uniqBy(jsonObject, 'hash'))
      const newDataCount = postsCount(newData)
      this.setState({ ...newData, searchResults: this.currentList(true) })
      this.props.navigation.setParams(newDataCount)
    } else {
      const rssObject = await rssParser.parse(starred)
      const jsonString = JSON.stringify(response)
      const jsonObject = JSON.parse(jsonString, reviver)
      const starredLinks = map(rssObject.items, item => get(item.links, ['0', 'url']))
      const uniqPostsStarred = lodash(jsonObject)
        .uniqBy('hash')
        .map(o => {
          o.starred = starredLinks.includes(o.href)
          return o
        })
        .value()
      const newData = filterPosts(uniqPostsStarred)
      const newDataCount = postsCount(newData)
      this.setState({ ...newData, searchResults: this.currentList(true) })
      this.props.navigation.setParams(newDataCount)
    }
  }

  addPost = async post => {
    const { preferences, allPosts } = this.state
    const index = findIndex(allPosts, ['hash', post.hash])
    const newCollection = allPosts
    if (index === -1) {
      newCollection.unshift(post)
    } else {
      newCollection[index] = post
    }
    const newData = filterPosts(newCollection)
    const newDataCount = postsCount(newData)
    this.setState({ ...newData, searchResults: this.currentList(true) })
    this.props.navigation.setParams(newDataCount)
    const response = await Api.postsAdd(post, preferences.apiToken)
    if(response.ok === 0) {
      if ( response.error === 503) { this.setState({ pinboardDown: true }) }
      handleResponseError(response.error, this.props.navigation)
    }
  }

  deletePost = async post => {
    const { preferences, allPosts, searchQuery, isSearchActive } = this.state
    const newCollection = reject(allPosts, { href: post.href })
    const newData = filterPosts(newCollection)
    const newDataCount = postsCount(newData)
    this.setState({ ...newData })
    if (isSearchActive) {
      this.onSearchChange(searchQuery)
    }
    this.props.navigation.setParams(newDataCount)
    const response = await Api.postsDelete(post.href, preferences.apiToken)
    if(response.ok === 0) {
      if ( response.error === 503) { this.setState({ pinboardDown: true }) }
      handleResponseError(response.error, this.props.navigation)
    }
  }

  filterSearchResults = (text, tags = false) => {
    return filter(this.currentList(), post => {
      const tagData = post.tags ? post.tags.join(' ').toLowerCase() : ''
      const postData = `
        ${post.href.toLowerCase()}
        ${post.description.toLowerCase()}
        ${post.extended.toLowerCase()}
        ${post.tags ? post.tags.join(' ').toLowerCase() : ''}
      `
      const returnData = tags ? tagData : postData
      return returnData.includes(text)
    })
  }

  similarSearchResults = () => {
    const similarQuery = maxBy(Object.keys(this.searchQueryCounts), o => this.searchQueryCounts[o])
    const similarResults = this.filterSearchResults(similarQuery)
    return {
      searchResults: similarResults,
      searchQuery: similarQuery,
    }
  }

  currentList = shouldFilter => {
    const current = this.props.navigation.getParam('list', 'allPosts')
    if (shouldFilter) {
      return this.filterSearchResults(this.state.searchQuery)
    }
    return this.state[current]
  }

  openDrawer = () => {
    Keyboard.dismiss()
    this.onSearchChange('')
    this.props.navigation.openDrawer()
  }

  toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible })
  }

  onRefresh = async () => {
    this.setState({ isLoading: true })
    const hasUpdates = await this.checkForUpdates()
    if (hasUpdates) {
      await this.fetchPosts()
    }
    this.setState({ isLoading: false })
  }

  getSearchQueryCounts = (results, query) => {
    return lodash(results)
      .map((res, i) => [query[i], res.length])
      .fromPairs()
      .omit('')
      .value()
  }

  onSearchChange = (evt, tags) => {
    const searchQuery = evt.nativeEvent ? evt.nativeEvent.text : evt
    const searchQueryArray = searchQuery.toLowerCase().split(' ')
    const allResults = map(searchQueryArray, text => this.filterSearchResults(text, tags))
    const uniqueResults = intersection(...allResults)
    this.searchQueryCounts = this.getSearchQueryCounts(allResults, searchQueryArray)
    this.setState({
      searchQuery: searchQuery,
      isSearchActive: !isEmpty(searchQuery),
      searchResults: uniqueResults,
    })
  }

  onShowSimilarResults = () => {
    const similarResults = this.similarSearchResults()
    if (similarResults.searchResults.length > 0) {
      this.setState(similarResults)
    }
  }

  onSubmitAddPost = post => {
    this.addPost(post)
  }

  onTagPress = tag => () => {
    this.onSearchChange(tag, true)
    this.listRef.scrollToOffset({ offset: 0, animated: false })
  }

  onCellPress = post => () => {
    const { openLinksExternal, markAsRead } = this.state.preferences
    if (openLinksExternal || post.href.includes('.pdf')) {
      Linking.canOpenURL(post.href).then(() => {
        Linking.openURL(post.href)
      })
    } else {
      this.props.navigation.navigate('Browser', { title: post.description, url: post.href })
    }
    if (markAsRead && post.toread) {
      post.toread = !post.toread
      post.meta = Math.random().toString(36) // PostCell change detection
      this.addPost(post)
    }
  }

  onCellLongPress = post => () => {
    Vibration.vibrate(5)
    this.toggleModal()
    this.setState({ selectedPost: post })
  }

  onToggleToread = () => {
    const { selectedPost } = this.state
    this.toggleModal()
    selectedPost.toread = !selectedPost.toread
    selectedPost.meta = Math.random().toString(36) // PostCell change detection
    this.addPost(selectedPost)
  }

  onEditPost = () => {
    const { navigation } = this.props
    const { selectedPost } = this.state
    this.toggleModal()
    navigation.navigate('Add', { post: selectedPost, onSubmit: navigation.getParam('onSubmit') })
  }

  onSharePost = () => {
    const { selectedPost } = this.state
    this.setState({ modalVisible: false }, () => {
      // Timeout needed to fix opening share dialog from modal
      setTimeout(() => openShareDialog(selectedPost.href, selectedPost.description), 500)
    })
  }

  openDeleteAlert = () => {
    const { selectedPost } = this.state
    Alert.alert(
      strings.common.deletePost,
      selectedPost.description,
      [
        { text: strings.common.cancel, style: 'cancel' },
        { text: strings.common.delete, onPress: () => this.deletePost(selectedPost), style: 'destructive' },
      ]
    )
  }

  onDeletePost = () => {
    this.setState({ modalVisible: false }, () => {
      // Timeout needed to fix opening alert from modal
      setTimeout(() => this.openDeleteAlert(), 500)
    })
  }

  renderRefreshControl = () => {
    if (this.state.isSearchActive) return null
    return <RefreshControl refreshing={this.state.isLoading} onRefresh={this.onRefresh} />
  }

  renderListHeader = () => {
    const isCurrentListEmpty = isEmpty(this.currentList())
    if (isCurrentListEmpty) return null
    const { isSearchActive, searchQuery, searchResults } = this.state
    return (
      <SearchBar
        isSearchActive={isSearchActive}
        searchQuery={searchQuery}
        onSearchChange={this.onSearchChange}
        count={searchResults.length}
      />
    )
  }

  renderPostCell = item => {
    const { preferences } = this.state
    return (
      <PostCell
        post={item}
        changeDetection={item.meta}
        onTagPress={this.onTagPress}
        onCellPress={this.onCellPress}
        onCellLongPress={this.onCellLongPress}
        exactDate={preferences.exactDate}
        tagOrder={preferences.tagOrder}
      />
    )
  }

  renderEmptyState = () => {
    const { isLoading, pinboardDown, isSearchActive, preferences, searchQuery } = this.state
    const isCurrentListEmpty = isEmpty(this.currentList())
    if (!preferences.apiToken) { return null }
    if (isSearchActive) {
      const similarResults = this.similarSearchResults()
      const hasSimilarResults = similarResults.searchResults.length > 0
      return <EmptyState
        action={hasSimilarResults ? this.onShowSimilarResults : undefined}
        actionText={`Show results for “${similarResults.searchQuery}”`}
        icon={icons.searchLarge}
        subtitle={`“${searchQuery}“`}
        title={strings.common.noResults}
        paddingBottom={this.keyboardHeight} />
    }
    if (pinboardDown && this.isConnected) {
      return <EmptyState
        action={this.onRefresh}
        actionText={strings.common.tryAgain}
        icon={icons.offlineLarge}
        subtitle={strings.error.pinboardDown}
        title={strings.error.troubleConnecting}
        paddingBottom={this.keyboardHeight} />
    }
    if (isCurrentListEmpty && !isLoading && this.isConnected) {
      const { navigation } = this.props
      return <EmptyState
        action={() => navigation.navigate('Add', { onSubmit: navigation.getParam('onSubmit') })}
        actionText={strings.add.titleAdd}
        icon={icons.simplepin}
        subtitle={strings.common.noPostsMessage}
        title={strings.common.noPosts}
        paddingBottom={this.keyboardHeight} />
    }
    if (isCurrentListEmpty && !isLoading && !this.isConnected) {
      return <EmptyState
        action={this.onRefresh}
        actionText={strings.common.tryAgain}
        icon={icons.offlineLarge}
        subtitle={strings.error.tryAgainOffline}
        title={strings.error.yourOffline}
        paddingBottom={this.keyboardHeight} />
    }
    return null
  }

  render() {
    const { isSearchActive, searchResults, selectedPost, modalVisible } = this.state
    const data = isSearchActive ? searchResults : this.currentList()
    return (
      <React.Fragment>
        <SafeAreaView style={s.safeArea} forceInset={{ bottom: 'never' }}>
          <FlatList
            ref={(ref) => this.listRef = ref}
            contentContainerStyle={s.container}
            data={data}
            initialNumToRender={8}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => this.renderPostCell(item)}
            refreshControl={this.renderRefreshControl()}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            style={s.list}
            ItemSeparatorComponent={() => <Separator left={padding.large} />}
            ListEmptyComponent={this.renderEmptyState()}
            ListHeaderComponent={this.renderListHeader()}
          />
        </SafeAreaView>
        <BottomSheet visible={modalVisible} onClose={this.toggleModal}>
          <BottomSheet.Title title={selectedPost.description} />
          <BottomSheet.Option title={`${strings.common.markAs} ${selectedPost.toread ? 'read' : 'unread'}`} onPress={this.onToggleToread} />
          <BottomSheet.Option title={strings.common.edit} onPress={this.onEditPost} />
          <BottomSheet.Option title={strings.common.share} onPress={this.onSharePost} />
          <BottomSheet.Option title={strings.common.delete} onPress={this.onDeletePost} />
          <BottomSheet.Option title={strings.common.cancel} onPress={this.toggleModal} />
        </BottomSheet>
      </React.Fragment>
    )
  }
}

PostsView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: color.white,
  },
  container : {
    flexGrow: 1,
    paddingTop: padding.medium,
    paddingBottom: padding.large,
  },
  list: {
    backgroundColor: color.white,
  },
})
