import React from 'react'
import { BackHandler, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { WebView } from 'react-native-webview'
import SafeAreaView from 'react-native-safe-area-view'
import PropTypes from 'prop-types'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import Storage from '../Storage'
import Readability from '../util/Readability'
import { fetchWithErrorHandling } from '../util/FetchUtil'
import { showSharePostDialog } from '../util/ShareUtil'
import NavigationButton from '../components/NavigationButton'
import { color, padding, row, icons } from '../style/style'

const isAndroid = Platform.OS === 'android'

const isBlackListed = url => {
  const blackList = ['youtube.com', 'vimeo.com']
  const domain = url.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0]
  return blackList.includes(domain)
}

const ToolbarButton = ({ disabled, onPress, icon }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      disabled={disabled}
      onPress={onPress}
      style={s.button}
    >
      <Image
        source={icon}
        style={[s.icon, disabled && s.iconDisabled]}
      />
    </TouchableOpacity>
  )
}

ToolbarButton.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired,
  icon: PropTypes.number.isRequired,
}

export default class BrowserView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', ''),
      headerLeft: <NavigationButton onPress={() => navigation.dismiss()} icon={icons.close} />,
    }
  }

  constructor(props) {
    super(props)
    this.url = null
    this.title = null
    this.state = {
      canGoBack: false,
      canGoForward: false,
      cleanHtml: undefined,
      readerMode: true,
    }
  }

  componentDidMount() {
    const { navigation } = this.props
    this.url = navigation.getParam('url')
    this.title = navigation.getParam('title')
    Storage.readerMode().then(value => this.setState({ readerMode: value && !isBlackListed(this.url) }))
    if (isAndroid) {
      BackHandler.addEventListener('hardwareBackPress', this.onAndroidBack)
    }
    if (this.state.readerMode) {
      this.fetchHtmlSource()
    }
  }

  componentWillUnmount() {
    if (isAndroid) {
      BackHandler.removeEventListener('hardwareBackPress', this.onAndroidBack)
    }
  }

  getCleanHtml = async html => {
    try {
      const article = await Readability.cleanHtml(html, this.url)
      if (!article) {
        this.setState({ cleanHtml: undefined, readerMode: false })
      } else {
        this.setState({ cleanHtml: Readability.cleanHtmlTemplate(this.title || article.title, article.content) })
      }
    } catch (e) {
      this.setState({ cleanHtml: undefined, readerMode: false })
    }
  }

  fetchHtmlSource = async () => {
    const response = await fetchWithErrorHandling(this.url, true)
    if (response.ok === 0) {
      this.setState({ cleanHtml: undefined, readerMode: false })
    } else {
      this.getCleanHtml(response)
    }
  }

  onNavigationStateChange = navState => {
    // Todo: this isn't called on SPA sites, need to inject some JS for that…
    if (!this.state.readerMode) {
      this.setState({
        canGoBack: navState.canGoBack,
        canGoForward: navState.canGoForward,
      })
    }
  }

  onAndroidBack = () => {
    if (this.state.canGoBack) {
      this.webViewRef.goBack()
      return true
    }
    return false
  }

  onShare = () => {
    showSharePostDialog(this.url, this.title)
  }

  toggleReaderMode = () => {
    this.setState({ readerMode: !this.state.readerMode })
  }

  renderToolbar() {
    const { canGoBack, canGoForward, readerMode, cleanHtml } = this.state
    return (
      <View style={s.toolbar}>
        <ToolbarButton
          disabled={!canGoBack}
          onPress={() => this.webViewRef.goBack()}
          icon={icons.left}
        />
        <ToolbarButton
          disabled={false}
          onPress={this.onShare}
          icon={icons.share}
        />
        <ToolbarButton
          disabled={!cleanHtml}
          onPress={this.toggleReaderMode}
          icon={readerMode ? icons.readerMode : icons.readerModeInactive}
        />
        <ToolbarButton
          disabled={!canGoForward}
          onPress={() => this.webViewRef.goForward()}
          icon={icons.right}
        />
      </View>
    )
  }

  render() {
    const { cleanHtml, readerMode } = this.state
    return (
      <SafeAreaView style={s.safeArea} forceInset={{ bottom: 'never', horizontal: 'never' }}>
        <View style={s.container}>
          {readerMode &&
            <WebView
              source={{ html: cleanHtml, baseUrl: this.url }}
              mixedContentMode="compatibility"
              startInLoadingState={true}
              onNavigationStateChange={this.onNavigationStateChange}
              originWhitelist={['*']}
              useWebKit={true}
            />
          }
          {!readerMode &&
            <WebView
              ref={ref => this.webViewRef = ref}
              source={{ uri: this.url }}
              startInLoadingState={true}
              onNavigationStateChange={this.onNavigationStateChange}
              originWhitelist={['*']}
              useWebKit={true}
            />
          }
          { this.renderToolbar() }
        </View>
      </SafeAreaView>
    )
  }
}

BrowserView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const s = StyleSheet.create({
  safeArea: {
    backgroundColor: color.white,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.black12,
    backgroundColor: color.white,
    paddingHorizontal: padding.medium,
    ...ifIphoneX({
      marginBottom: padding.medium,
    }),
  },
  button: {
    width: '25%',
    height: row.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    tintColor: color.blue2,
    resizeMode: 'contain',
  },
  iconDisabled: {
    tintColor: color.gray1,
  },
})
