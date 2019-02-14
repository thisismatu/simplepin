import React from 'react'
import { View, StyleSheet, Platform, Image, Text, TextInput, Switch, TouchableOpacity, Alert, BackHandler, SectionList, Animated } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import PropTypes from 'prop-types'
import lodash from 'lodash/lodash'
import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import flattenDeep from 'lodash/flattenDeep'
import uniq from 'lodash/uniq' // eslint-disable-line no-unused-vars
import filter from 'lodash/filter'
import keys from 'lodash/keys'
import map from 'lodash/map'
import difference from 'lodash/difference'
import startsWith from 'lodash/startsWith'
import isUrl from 'is-url'
import Api from 'app/Api'
import { handleResponseError } from 'app/util/ErrorUtils'
import Storage from 'app/util/Storage'
import NavigationButton from 'app/components/NavigationButton'
import Separator from 'app/components/Separator'
import { color, padding, font, line, row, radius, icons, shadow } from 'app/style/style'
import strings from 'app/style/strings'

const isAndroid = Platform.OS === 'android'

class ResultItem extends React.PureComponent {
  render() {
    const { tag, suggested, onPress } = this.props
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => onPress(tag)}
        style={s.resultCell}
        >
        <Text style={s.resultText}>{tag}</Text>
        {!!suggested && <Text style={s.suggestedText}>Suggested</Text>}
      </TouchableOpacity>
    )
  }
}

ResultItem.propTypes = {
  tag: PropTypes.string.isRequired,
  suggested: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired,
}

class Tag extends React.PureComponent {
  render() {
    const { tag, onPress } = this.props
    const isPrivateTag = startsWith(tag, '.')
    const tint = isPrivateTag ? color.gray3 : color.blue2
    return (
      <TouchableOpacity
        key={tag}
        activeOpacity={0.5}
        onPress={() => onPress(tag)}
        style={s.tagCell}
        >
        <View style={[s.tag, isPrivateTag && s.privateTag]}>
          <Text style={[s.tagText, isPrivateTag && s.privateTagText]}>{tag}</Text>
          <Image source={icons.closeSmall} style={s.tagIcon} tintColor={tint} />
        </View>
      </TouchableOpacity>
    )
  }
}

Tag.propTypes = {
  tag: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
}

export default class AddPostView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const post = navigation.getParam('post')
    return {
      title: post ? strings.add.titleEdit : strings.add.titleAdd,
      headerLeft: <NavigationButton
        onPress={navigation.getParam('onDismiss')}
        icon={icons.close}
      />,
      headerRight: <NavigationButton
        onPress={navigation.getParam('onSave')}
        text={post ? strings.add.buttonSave : strings.add.buttonAdd}
      />,
    }
  }

  constructor(props) {
    super(props)
    this.shakeAnim = new Animated.Value(0)
    this.shakeStyle = {
      transform: [{
        translateX: this.shakeAnim.interpolate({
          inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
          outputRange: [0, 3, -3, 3, -3, 0, 3, -3, 3, -3, 0],
        }),
      }],
    }
    this.state = {
      validHref: false,
      validDescription: false,
      unsavedChanges: false,
      suggestedTags: [],
      userTags: [],
      scrollEnabled: true,
      searchQuery: '',
      searchResults: {},
      searchHeight: 200,
      searchVisible: false,
      post: {
        description: '',
        extended: '',
        hash: '',
        href: '',
        meta: '',
        shared: true,
        tags: [],
        time: new Date(),
        toread: false,
      },
    }
  }

  componentDidMount() {
    const { navigation } = this.props
    const post = navigation.getParam('post')
    if (post) {
      this.setState({ post: post })
    } else {
      Storage.userPreferences().then(prefs => {
        this.setState(state => {
          state.post.shared = !prefs.privateByDefault
          state.post.toread = prefs.unreadByDefault
          return state
        })
      })
    }
    if (isAndroid) {
      BackHandler.addEventListener('hardwareBackPress', this.onAndroidBack)
    }
    navigation.setParams({
      onDismiss: this.onUnsavedDismiss,
      onSave: this.onSave,
    })
    this.fetchTags()
  }

  componentWillUnmount() {
    if (isAndroid) {
      BackHandler.removeEventListener('hardwareBackPress')
    }
  }

  fetchTags = async () => {
    const apiToken = await Storage.apiToken()
    const response = await Api.tagsAll(apiToken)
    const suggested = await Api.tagsSuggested(this.state.post.href, apiToken)
    if(response.ok === 0) {
      handleResponseError(response.error, this.props.navigation)
    } else {
      const suggestedTags = lodash([suggested[0].popular, suggested[1].recommended])
        .flattenDeep()
        .compact()
        .uniq()
        .value()
      this.setState({
        suggestedTags: suggestedTags,
        userTags: keys(response),
      })
    }
  }

  animate = () => {
    this.shakeAnim.setValue(0)
    Animated.timing(this.shakeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }

  isValidPost = (href, description) => {
    const validHref = isUrl(href)
    const validDescription = !isEmpty(description)
    this.setState({ validHref, validDescription }, () => this.animate())
    return validHref && validDescription
  }

  onUnsavedDismiss = () => {
    const { navigation } = this.props
    const { unsavedChanges } = this.state
    if (unsavedChanges) {
      Alert.alert(
        strings.add.discardUnsaved, null,
        [
          { text: strings.common.cancel, style: 'cancel' },
          { text: strings.common.discard, onPress: () => navigation.dismiss() },
        ]
      )
    } else {
      navigation.dismiss()
    }
  }

  onAndroidBack = () => {
    this.onUnsavedDismiss()
    return true
  }

  onHrefChange = (evt) => {
    const { text } = evt.nativeEvent
    this.setState(state => {
      state.post.href = text.trim()
      state.unsavedChanges = true
      return state
    })
  }

  onDescriptionChange = (evt) => {
    const { text } = evt.nativeEvent
    this.setState(state => {
      state.post.description = text
      state.unsavedChanges = true
      return state
    })
  }

  onExtendedChange = (evt) => {
    const { text } = evt.nativeEvent
    this.setState(state => {
      state.post.extended = text
      state.unsavedChanges = true
      return state
    })
  }

  onShared = (value) => {
    this.setState(state => {
      state.post.shared = !value
      state.unsavedChanges = true
      return state
    })
  }

  onToread = (value) => {
    this.setState(state => {
      state.post.toread = value
      state.unsavedChanges = true
      return state
    })
  }

  onTagsChange = (evt) => {
    const { text } = evt.nativeEvent
    this.setState({
      searchQuery: text.trim(),
      unsavedChanges: true,
    })
    this.filterSearchResults(text)
  }

  filterSearchResults = text => {
    const { post, userTags, suggestedTags } = this.state
    const suggestedTagsResults = filter(difference(suggestedTags, post.tags), tag => tag.includes(text))
    const userTagsResults = filter(difference(userTags, flattenDeep([post.tags, suggestedTags])), tag => tag.includes(text))
    const searchResults = flattenDeep([suggestedTagsResults, userTagsResults])
    const searchVisible = !isEmpty(searchResults) && !isEmpty(text)
    this.setState(state => {
      state.searchVisible = searchVisible,
      state.scrollEnabled = !searchVisible,
      state.searchResults.suggested = suggestedTagsResults
      state.searchResults.user = userTagsResults
      return state
    })
  }

  removeTag = (tagToRemove) => {
    const { post } = this.state
    const updatedTags = filter(post.tags, tag =>  tag !== tagToRemove)
    this.setState(state => (state.post.tags = updatedTags, state))
  }

  selectTag = (tag) => {
    const { post } = this.state
    post.tags.push(tag)
    this.setState(state => {
      state.post.tags = post.tags
      state.searchVisible = false
      state.scrollEnabled = true
      state.searchQuery = ''
      return state
    })
  }

  onSave = () => {
    const { navigation } = this.props
    const { post } = this.state
    const tags = compact(post.tags)
    if (!this.isValidPost(post.href, post.description)) { return }
    post.description = post.description.trim()
    post.extended = post.extended.trim()
    post.tags = !isEmpty(tags) ? tags : null
    post.meta = Math.random().toString(36) // PostCell change detection
    navigation.state.params.onSubmit(post)
    navigation.dismiss()
  }

  renderSearchResults = () => {
    const { searchResults, searchHeight, contentOffset = 0 } = this.state
    const containerHeight = { height: searchHeight - contentOffset - padding.small }
    const topOffset = { top: contentOffset }
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[s.resultsOverlay, topOffset]}
        onPress={() => this.setState({ searchVisible: false, scrollEnabled: true })}
      >
        <View style={[s.resultsContainer, containerHeight]}>
          <SectionList
            sections={[{
              data: searchResults.suggested,
              renderItem: ({ item }) => <ResultItem tag={item} suggested={true} onPress={this.selectTag} />,
            }, {
              data: searchResults.user,
              renderItem: ({ item }) => <ResultItem tag={item} suggested={false} onPress={this.selectTag} />,
            }]}
            keyExtractor={(item, index) => item + index}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            contentContainerStyle={s.resultsList}
          />
        </View>
      </TouchableOpacity>
    )
  }

  renderTags = () => {
    const { post } = this.state
    return (
      <View style={s.tagContainer}>
        {map(post.tags, (item) => <Tag key={item} tag={item} onPress={this.removeTag} />)}
      </View>
    )
  }

  render() {
    const { post, scrollEnabled, searchQuery, searchVisible, validHref, validDescription } = this.state
    const track = isAndroid ? color.blue2 + '88' : color.blue2
    const thumb = (isEnabled) => isAndroid && isEnabled ? color.blue2 : null

    return (
      <KeyboardAwareScrollView
        scrollEnabled={scrollEnabled}
        contentContainerStyle={s.container}
        contentInsetAdjustmentBehavior="always"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        style={s.list}
        onScroll={evt => this.setState({ contentOffset: evt.nativeEvent.contentOffset.y })}
        >
        <Animated.View style={!validHref && this.shakeStyle}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={true}
            keyboardType="url"
            onChange={this.onHrefChange}
            onSubmitEditing={() => { this.descriptionRef.focus() }}
            placeholder={strings.add.placeholderHref}
            placeholderTextColor = {color.gray2}
            returnKeyType="next"
            style={s.textInput}
            underlineColorAndroid="transparent"
            value={post.href}
          />
        </Animated.View>
        <Separator />
        <Animated.View style={!validDescription && this.shakeStyle}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={true}
            onChange={this.onDescriptionChange}
            onSubmitEditing={() => { this.extendedRef.focus() }}
            placeholder={strings.add.placeholderDescription}
            placeholderTextColor = {color.gray2}
            ref={input => this.descriptionRef = input}
            returnKeyType="next"
            style={s.textInput}
            underlineColorAndroid="transparent"
            value={post.description}
          />
        </Animated.View>
        <Separator />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          enablesReturnKeyAutomatically={true}
          multiline={true}
          onChange={this.onExtendedChange}
          onSubmitEditing={() => { this.tagsRef.focus() }}
          placeholder={strings.add.placeholderExtended}
          placeholderTextColor = {color.gray2}
          ref={input => this.extendedRef = input}
          returnKeyType="next"
          style={[s.textInput, s.textArea]}
          textAlignVertical="top"
          underlineColorAndroid="transparent"
          value={post.extended}
        />
        <Separator onLayout={evt => this.setState({ searchHeight: evt.nativeEvent.layout.y })} />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          enablesReturnKeyAutomatically={true}
          onChange={this.onTagsChange}
          onSubmitEditing={evt => this.selectTag(evt.nativeEvent.text)}
          placeholder={strings.add.placeholderTags}
          placeholderTextColor = {color.gray2}
          ref={input => this.tagsRef = input}
          returnKeyType="done"
          style={s.textInput}
          underlineColorAndroid="transparent"
          value={searchQuery}
        />
        {!isEmpty(post.tags) && this.renderTags()}
        <Separator />
        <View style={s.cell}>
          <Text style={s.text}>{strings.posts.private}</Text>
          <Switch
            style={s.switch}
            trackColor={{ true: track }}
            thumbColor={thumb(!post.shared)}
            onValueChange={this.onShared}
            value={!post.shared}
          />
        </View>
        <Separator />
        <View style={s.cell}>
          <Text style={s.text}>{strings.add.readLater}</Text>
          <Switch
            style={s.switch}
            trackColor={{ true: track }}
            thumbColor={thumb(post.toread)}
            onValueChange={this.onToread}
            value={post.toread}
          />
        </View>
        <Separator />
        { searchVisible && this.renderSearchResults() }
      </KeyboardAwareScrollView>
    )
  }
}

AddPostView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const s = StyleSheet.create({
  container: {
    paddingVertical: padding.medium,
  },
  list: {
    backgroundColor: color.white,
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: row.medium,
  },
  text: {
    color: color.gray4,
    fontSize: font.large,
    paddingLeft: padding.medium,
  },
  textInput: {
    backgroundColor: color.white,
    color: color.gray4,
    fontSize: font.large,
    height: row.medium,
    paddingHorizontal: padding.medium,
    width: '100%',
  },
  textArea: {
    height: 100,
    marginVertical: 9,
  },
  switch: {
    marginRight: isAndroid ? 12 : padding.medium,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: padding.small,
  },
  tagCell: {
    padding: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.blue1,
    borderRadius: radius.small,
    paddingHorizontal: padding.small,
    paddingVertical: padding.tiny,
  },
  tagText: {
    color: color.blue2,
    fontSize: font.small,
    lineHeight: line.small,
  },
  privateTag: {
    backgroundColor: color.gray1,
  },
  privateTagText: {
    color: color.gray3,
  },
  tagIcon: {
    resizeMode: 'contain',
    width: 12,
    height: 12,
    marginLeft: 4,
  },
  resultsOverlay: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    zIndex: 9999,
  },
  resultsContainer: {
    margin: padding.small,
    backgroundColor: color.white,
    borderRadius: radius.medium,
    ...shadow,
  },
  resultsList: {
    paddingVertical: padding.small,
  },
  resultCell: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: padding.medium,
    paddingVertical: padding.small,
  },
  resultText: {
    fontSize: font.medium,
    lineHeight: line.medium,
  },
  suggestedText: {
    color: color.gray3,
    fontSize: font.small,
  },
})
