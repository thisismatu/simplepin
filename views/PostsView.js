import React from 'react'
import { Alert, FlatList, Keyboard, Linking, NetInfo, RefreshControl, StyleSheet, Vibration } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import PropTypes from 'prop-types'
import rssParser from 'react-native-rss-parser'
import filter from 'lodash/filter'
import findIndex from 'lodash/findIndex'
import fromPairs from 'lodash/fromPairs' // eslint-disable-line no-unused-vars
import get from 'lodash/get'
import intersection from 'lodash/intersection'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import lodash from 'lodash/lodash'
import map from 'lodash/map' // eslint-disable-line no-unused-vars
import maxBy from 'lodash/maxBy'
import omit from 'lodash/omit' // eslint-disable-line no-unused-vars
import reject from 'lodash/reject'
import uniqBy from 'lodash/uniqBy'
import Api from 'app/Api'
import Storage from 'app/Storage'
import { reviver } from 'app/util/JsonUtil'
import { handleResponseError } from 'app/util/ErrorUtil'
import { showSharePostDialog } from 'app/util/ShareUtil'
import BottomSheet from 'app/components/BottomSheet'
import EmptyState from 'app/components/EmptyState'
import NavigationButton from 'app/components/NavigationButton'
import PostCell from 'app/components/PostCell'
import SearchBar from 'app/components/SearchBar'
import Separator from 'app/components/Separator'
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
    this.isConnected = true
    this.lastUpdateTime = null
    this.dataHolder = []
    this.searchQuery = ''
    this.similarSearchQuery = ''
    this.similarSearchResults = []
    this.state = {
      init: false,
      data: [],
      isLoading: true,
      modalVisible: false,
      selectedPost: {},
      pinboardDown: false,
      keyboardHeight: 0,
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
    navigation.setParams({
      onSubmit: this.onSubmitAddPost,
      openDrawer: this.openDrawer,
    })
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
    const previousList = prevProps.navigation.getParam('list')
    const currentList = this.props.navigation.getParam('list')
    if (!isEqual(previousList, currentList)) {
      this.setState({ data: this.dataHolder[currentList] })
    }
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange)
  }

  keyboardDidShow = evt => {
    const keyboardHeight = evt && evt.endCoordinates.height
    if (this.state.keyboardHeight !== keyboardHeight) {
      this.setState({ keyboardHeight })
    }
  }

  keyboardDidHide = () => {
    if (this.state.keyboardHeight !== 0) {
      this.setState({ keyboardHeight: 0 })
    }
  }

  handleConnectivityChange = isConnected => {
    this.isConnected = isConnected
  }

  getCurrentList = () => {
    const currentList = this.props.navigation.getParam('list', 'allPosts')
    return this.dataHolder[currentList]
  }

  isSearchActive = () => !isEmpty(this.searchQuery)

  isCurrentListEmpty = () => isEmpty(this.getCurrentList())

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
      this.setState({ data: newData.allPosts })
      this.dataHolder = newData
      this.props.navigation.setParams(newDataCount)
    } else {
      const rssObject = await rssParser.parse(starred)
      const jsonString = JSON.stringify(response)
      const jsonObject = JSON.parse(jsonString, reviver)
      const starredLinks = rssObject.items.map(item => get(item.links, ['0', 'url']))
      const uniqPostsStarred = lodash(jsonObject)
        .uniqBy('hash')
        .map(o => {
          o.starred = starredLinks.includes(o.href)
          return o })
        .value()
      const newData = filterPosts(uniqPostsStarred)
      const newDataCount = postsCount(newData)
      this.setState({ data: newData.allPosts })
      this.dataHolder = newData
      this.props.navigation.setParams(newDataCount)
    }
  }

  addPost = async post => {
    const { preferences } = this.state
    const { allPosts } = this.dataHolder
    const currentList = this.props.navigation.getParam('list', 'allPosts')
    const index = findIndex(allPosts, ['hash', post.hash])
    const newCollection = allPosts
    if (index === -1) {
      newCollection.unshift(post)
    } else {
      newCollection[index] = post
    }
    const newData = filterPosts(newCollection)
    const newDataCount = postsCount(newData)
    this.setState({ data: newData[currentList] })
    this.dataHolder = newData
    this.props.navigation.setParams(newDataCount)
    const response = await Api.postsAdd(post, preferences.apiToken)
    if(response.ok === 0) {
      if ( response.error === 503) { this.setState({ pinboardDown: true }) }
      handleResponseError(response.error, this.props.navigation)
    }
  }

  deletePost = async post => {
    const { preferences } = this.state
    const { allPosts } = this.dataHolder
    const currentList = this.props.navigation.getParam('list', 'allPosts')
    const newCollection = reject(allPosts, { href: post.href })
    const newData = filterPosts(newCollection)
    const newDataCount = postsCount(newData)
    this.setState({ data: newData[currentList] })
    this.dataHolder = newData
    if (this.isSearchActive()) {
      this.onSearchChange(this.searchQuery)
    }
    this.props.navigation.setParams(newDataCount)
    const response = await Api.postsDelete(post.href, preferences.apiToken)
    if(response.ok === 0) {
      if ( response.error === 503) { this.setState({ pinboardDown: true }) }
      handleResponseError(response.error, this.props.navigation)
    }
  }

  filterSearchResults = (text, tagOnly = false) => {
    const currentList = this.getCurrentList()
    return filter(currentList, post => {
      const tagData = post.tags ? post.tags.join(' ').toLowerCase() : ''
      const postData = `
        ${post.href.toLowerCase()}
        ${post.description.toLowerCase()}
        ${post.extended.toLowerCase()}
        ${tagData}
      `
      const returnData = tagOnly ? tagData : postData
      return returnData.includes(text)
    })
  }

  showSimilarSearchResults = () => {
    this.setState({ data: this.similarSearchResults })
    this.searchQuery = this.similarSearchQuery
  }

  getsearchQueryMatches = (results, query) => {
    return lodash(results)
      .map((res, i) => [query[i], res.length])
      .fromPairs()
      .omit('')
      .value()
  }

  onSearchChange = (query, tagOnly = false) => {
    const searchQueryArray = query.toLowerCase().split(' ')
    const allResults = searchQueryArray.map(text => this.filterSearchResults(text, tagOnly))
    const uniqResults = intersection(...allResults)
    const matches = this.getsearchQueryMatches(allResults, searchQueryArray)
    const similarQuery = maxBy(Object.keys(matches), o => matches[o])
    const similarResults = this.filterSearchResults(similarQuery)
    this.setState({ data: uniqResults })
    this.searchQuery = query
    this.similarSearchResults = similarResults
    this.similarSearchQuery = similarQuery
  }

  clearSearch = () => {
    this.setState({ data: this.getCurrentList() })
    this.searchQuery = ''
  }

  openDrawer = () => {
    Keyboard.dismiss()
    if (this.isSearchActive()) {
      this.clearSearch()
    }
    this.props.navigation.openDrawer()
  }

  toggleModal = () => this.setState({ modalVisible: !this.state.modalVisible })

  onRefresh = async () => {
    this.setState({ isLoading: true })
    const hasUpdates = await this.checkForUpdates()
    if (hasUpdates) {
      await this.fetchPosts()
    }
    this.setState({
      init: true,
      isLoading: false,
    })
  }

  onSubmitAddPost = post => this.addPost(post)

  onCellPress = post => {
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

  onCellLongPress = post => {
    Vibration.vibrate(5)
    this.toggleModal()
    this.setState({ selectedPost: post })
  }

  onTagPress = tag => {
    this.onSearchChange(tag, true)
    this.listRef.scrollToOffset({ offset: 0, animated: false })
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
      setTimeout(() => showSharePostDialog(selectedPost.href, selectedPost.description), 500)
    })
  }

  showDeletePostAlert = () => {
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
      setTimeout(() => this.showDeletePostAlert(), 500)
    })
  }

  renderRefreshControl = () => {
    return <RefreshControl
      refreshing={this.state.isLoading}
      onRefresh={this.onRefresh} />
  }

  renderListHeader = () => {
    const { data, init } = this.state
    if (!init) return null
    return <SearchBar
      searchQuery={this.searchQuery}
      onSearchChange={this.onSearchChange}
      onClearSearch={this.clearSearch}
      matches={data && data.length} />
  }

  renderPostCell = item => {
    const { preferences } = this.state
    return <PostCell
      post={item}
      changeDetection={item.meta}
      onTagPress={this.onTagPress}
      onCellPress={this.onCellPress}
      onCellLongPress={this.onCellLongPress}
      exactDate={preferences.exactDate}
      tagOrder={preferences.tagOrder} />
  }

  renderEmptyState = () => {
    const { isLoading, pinboardDown, preferences, keyboardHeight } = this.state
    if (!preferences.apiToken) { return null }
    if (this.isSearchActive()) {
      const hasSimilarSearchResults = this.similarSearchResults.length > 0
      return <EmptyState
        action={hasSimilarSearchResults ? this.showSimilarSearchResults : undefined}
        actionText={`Show results for “${this.similarSearchQuery}”`}
        icon={icons.searchLarge}
        subtitle={`“${this.searchQuery}“`}
        title={strings.common.noResults}
        paddingBottom={keyboardHeight} />
    }
    if (pinboardDown && this.isConnected) {
      return <EmptyState
        action={this.onRefresh}
        actionText={strings.common.tryAgain}
        icon={icons.offlineLarge}
        subtitle={strings.error.pinboardDown}
        title={strings.error.troubleConnecting}
        paddingBottom={keyboardHeight} />
    }
    if (this.isCurrentListEmpty() && !isLoading && this.isConnected) {
      const { navigation } = this.props
      return <EmptyState
        action={() => navigation.navigate('Add', { onSubmit: navigation.getParam('onSubmit') })}
        actionText={strings.add.titleAdd}
        icon={icons.simplepin}
        subtitle={strings.common.noPostsMessage}
        title={strings.common.noPosts}
        paddingBottom={keyboardHeight} />
    }
    if (this.isCurrentListEmpty() && !isLoading && !this.isConnected) {
      return <EmptyState
        action={this.onRefresh}
        actionText={strings.common.tryAgain}
        icon={icons.offlineLarge}
        subtitle={strings.error.tryAgainOffline}
        title={strings.error.yourOffline}
        paddingBottom={keyboardHeight} />
    }
    return null
  }

  render() {
    const { selectedPost, modalVisible, data } = this.state
    const toreadText = selectedPost.toread ? 'read' : 'unread'
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
            ListEmptyComponent={this.renderEmptyState}
            ListHeaderComponent={this.renderListHeader}
          />
        </SafeAreaView>
        <BottomSheet visible={modalVisible} onClose={this.toggleModal}>
          <BottomSheet.Title title={selectedPost.description} />
          <BottomSheet.Option title={`${strings.common.markAs} ${toreadText}`} onPress={this.onToggleToread} />
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
