import React from 'react'
import { SafeAreaView, View, StyleSheet, Platform, Image, Text, TextInput, Switch, TouchableOpacity, Alert, BackHandler, SectionList } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import PropTypes from 'prop-types'
import lodash from 'lodash/lodash'
import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import flattenDeep from 'lodash/flattenDeep'
import uniq from 'lodash/uniq'
import omit from 'lodash/omit'
import filter from 'lodash/filter'
import keys from 'lodash/keys'
import map from 'lodash/map'
import difference from 'lodash/difference'
import isUrl from 'is-url'
import Api from 'app/Api'
import { handleResponseError } from 'app/util/ErrorUtils'
import Storage from 'app/util/Storage'
import NavigationButton from 'app/components/NavigationButton'
import Separator from 'app/components/Separator'
import { color, padding, font, line, row, radius, icons } from 'app/style/style'
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
    return (
      <TouchableOpacity
        key={tag}
        activeOpacity={0.5}
        onPress={() => onPress(tag)}
        style={s.tagCell}
      >
        <View style={s.tag}>
          <Text style={s.tagText}>{tag}</Text>
          <Image source={icons.closeSmall} style={s.tagIcon} />
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
    this.isEditing = false
    this.initialState = {}
    this.suggestedTags = []
    this.userTags = []
    this.state = {
      enabled: true,
      searchQuery: '',
      searchResults: [],
      searchHeight: 200,
      searchVisible: false,
      description: '',
      extended: '',
      hash: '',
      href: '',
      meta: '',
      shared: true,
      tags: [],
      time: new Date(),
      toread: false,
    }
  }

  componentDidMount() {
    const { navigation } = this.props
    const post = navigation.getParam('post')
    if (post) {
      this.isEditing = true
      this.setState(post, () => this.setInitialState(this.state))
    } else {
      Storage.userPreferences().then(prefs => {
        this.setState({
          shared: !prefs.privateByDefault,
          toread: prefs.unreadByDefault,
        }, () => this.setInitialState(this.state))
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

  setInitialState = (currentState) => {
    this.initialState = currentState
  }

  fetchTags = async () => {
    const apiToken = await Storage.apiToken()
    const response = await Api.tagsAll(apiToken)
    const suggested = await Api.tagsSuggested(this.state.href, apiToken)
    if(response.ok === 0) {
      handleResponseError(response.error, this.props.navigation)
    } else {
      const suggestedTags = lodash([suggested[0].popular, suggested[1].recommended])
        .flattenDeep()
        .compact()
        .uniq()
        .value()
      this.suggestedTags = suggestedTags
      this.userTags = keys(response)
    }
  }

  onUnsavedDismiss = () => {
    if (isEqual(this.initialState, this.state)) {
      this.props.navigation.dismiss()
    } else {
      Alert.alert(
        this.isEditing ? strings.add.discardEdit : strings.add.discardAdd,
        null,
        [
          { text: strings.common.cancel, style: 'cancel' },
          { text: strings.common.ok, onPress: () => this.props.navigation.dismiss() },
        ]
      )
    }
  }

  onAndroidBack = () => {
    this.onUnsavedDismiss()
    return true
  }

  isValidPost = (href, description) => {
    return isUrl(href) && !isEmpty(description)
  }

  onHrefChange = (evt) => {
    this.setState({ href: evt.nativeEvent.text.trim() })
  }

  onDescriptionChange = (evt) => {
    this.setState({ description: evt.nativeEvent.text })
  }

  onExtendedChange = (evt) => {
    this.setState({ extended: evt.nativeEvent.text })
  }

  removeTag = (tag) => {
    const { tags } = this.state
    const updatedTags = filter(tags, t =>  t !== tag)
    this.setState({ tags: updatedTags })
  }

  selectTag = (tag) => {
    const { tags } = this.state
    tags.push(tag)
    this.setState({
      tags: tags,
      searchVisible: false,
      enabled: true,
      searchQuery: '',
    })
  }

  onTagsChange = (evt) => {
    const query = evt.nativeEvent.text
    this.setState({
      searchQuery: query.trim(),
      searchVisible: true,
      enabled: false,
    })
    if (!isEmpty(query)) {
      const suggestedTagsResults = filter(difference(this.suggestedTags, this.state.tags), tag => tag.includes(query))
      const userTagsResults = filter(difference(this.userTags, flattenDeep([this.state.tags, this.suggestedTags])), tag => tag.includes(query))
      this.setState({ searchResults: {
        suggested: suggestedTagsResults,
        user: userTagsResults,
      } })
      if (isEmpty(flattenDeep([suggestedTagsResults, userTagsResults]))) {
        this.setState({
          searchVisible: false,
          enabled: true,
        })
      }
    } else {
      this.setState({
        searchVisible: false,
        enabled: true,
      })
    }
  }

  onShared = (value) => {
    this.setState({ shared: !value })
  }

  onToread = (value) => {
    this.setState({ toread: value })
  }

  onSave = () => {
    const ignore = ['searchResults', 'enabled', 'searchHeight', 'searchVisible']
    const post = omit(this.state, ignore)
    const tags = compact(post.tags)
    if (!this.isValidPost(post.href, post.description)) { return }
    post.description = post.description.trim()
    post.extended = post.extended.trim()
    post.tags = !isEmpty(tags) ? tags : null
    post.meta = Math.random().toString(36) // PostCell change detection
    this.props.navigation.state.params.onSubmit(post)
    this.props.navigation.dismiss()
  }

  renderSearchResults = () => {
    const { searchResults } = this.state
    return (
      <SectionList
        ref={(ref) => this.flatList = ref}
        sections={[{
          title: 'suggested',
          data: searchResults.suggested,
          renderItem: ({ item }) => <ResultItem tag={item} suggested={true} onPress={this.selectTag} />,
        }, {
          title: 'tags',
          data: searchResults.user,
          renderItem: ({ item }) => <ResultItem tag={item} suggested={false} onPress={this.selectTag} />,
        }]}
        keyExtractor={(item, index) => item + index}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        style={[s.resultList, { height: this.state.searchHeight }]}
        contentContainerStyle={{ paddingVertical: padding.small }}
      />
    )
  }

  renderTags = () => {
    const { tags } = this.state
    return (
      <View style={s.tagContainer}>
        {map(tags, (item) => <Tag key={item} tag={item} onPress={this.removeTag} />)}
      </View>
    )
  }

  render() {
    const { description, extended, href, shared, tags, toread, searchResults } = this.state
    const track = isAndroid ? color.blue2 + '88' : color.blue2
    const thumb = (isEnabled) => isAndroid && isEnabled ? color.blue2 : null

    return (
      <SafeAreaView style={s.safeArea}>
        <KeyboardAwareScrollView
          scrollEnabled={this.state.enabled}
          contentContainerStyle={s.container}
          keyboardShouldPersistTaps="handled"
          style={s.list}
        >
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={true}
            onChange={this.onHrefChange}
            onSubmitEditing={() => { this.descriptionInput.focus() }}
            placeholder={strings.add.placeholderHref}
            placeholderTextColor = {color.gray2}
            returnKeyType="next"
            style={s.textInput}
            underlineColorAndroid="transparent"
            value={href}
          />
          <Separator />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={true}
            onChange={this.onDescriptionChange}
            onSubmitEditing={() => { this.extendedInput.focus() }}
            placeholder={strings.add.placeholderDescription}
            placeholderTextColor = {color.gray2}
            ref={(input) => {this.descriptionInput = input}}
            returnKeyType="next"
            style={s.textInput}
            underlineColorAndroid="transparent"
            value={description}
          />
          <Separator />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={true}
            multiline={true}
            onChange={this.onExtendedChange}
            onSubmitEditing={() => { this.tagsInput.focus() }}
            placeholder={strings.add.placeholderExtended}
            placeholderTextColor = {color.gray2}
            ref={(input) => {this.extendedInput = input}}
            returnKeyType="next"
            style={[s.textInput, s.textArea]}
            textAlignVertical="top"
            underlineColorAndroid="transparent"
            value={extended}
          />
          <Separator />
          { !isEmpty(tags) && this.renderTags() }
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={true}
            onChange={this.onTagsChange}
            onSubmitEditing={evt => this.selectTag(evt.nativeEvent.text)}
            onLayout={evt => this.setState({ searchHeight: evt.nativeEvent.layout.y })}
            placeholder={strings.add.placeholderTags}
            placeholderTextColor = {color.gray2}
            ref={(input) => {this.tagsInput = input}}
            returnKeyType="done"
            style={s.textInput}
            underlineColorAndroid="transparent"
            value={this.state.searchQuery}
          />
          <Separator />
          <View style={s.cell}>
            <Text style={s.text}>{strings.posts.private}</Text>
            <Switch
              style={s.switch}
              trackColor={{ true: track }}
              thumbColor={thumb(!shared)}
              onValueChange={this.onShared}
              value={!shared}
            />
          </View>
          <Separator />
          <View style={s.cell}>
            <Text style={s.text}>{strings.add.readLater}</Text>
            <Switch
              style={s.switch}
              trackColor={{ true: track }}
              thumbColor={thumb(toread)}
              onValueChange={this.onToread}
              value={toread}
            />
          </View>
          <Separator />
          { this.state.searchVisible && this.renderSearchResults() }
        </KeyboardAwareScrollView>
      </SafeAreaView>
    )
  }
}

AddPostView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const s = StyleSheet.create({
  safeArea: {
    backgroundColor: color.white,
    flex: 1,
  },
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
    paddingTop: padding.small,
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
  tagIcon: {
    resizeMode: 'contain',
    width: 12,
    height: 12,
    tintColor: color.blue2,
    marginLeft: 4,
  },
  resultList: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%',
    backgroundColor: color.white,
    zIndex: 9999,
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
  }
})
