import React from 'react'
import { View, Image, WebView, StyleSheet, TouchableOpacity, Platform, BackHandler, Share } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import PropTypes from 'prop-types'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import { fetchWithErrorHandling } from 'app/util/FetchUtil'
import Readability from 'app/util/Readability'
import Storage from 'app/Storage'
import NavigationButton from 'app/components/NavigationButton'
import EmptyState from 'app/components/EmptyState'
import { color, padding, row, icons } from 'app/style/style'
import strings from 'app/style/strings'

const isAndroid = Platform.OS === 'android'

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
      error: false,
    }
  }

  componentDidMount() {
    const { navigation } = this.props
    this.url = navigation.getParam('url')
    this.title = navigation.getParam('title')
    Storage.readerMode().then(value => this.setState({ readerMode: value }))
    if (isAndroid) {
      BackHandler.addEventListener('hardwareBackPress', this.onAndroidBack)
    }
    this.fetchCleanHtml()
  }

  componentWillUnmount() {
    if (isAndroid) {
      BackHandler.removeEventListener('hardwareBackPress')
    }
  }

  fetchCleanHtml = async () => {
    console.log('fetchCleanHtml')
    const response = await fetchWithErrorHandling(this.url, true)
    if (response.ok === 0) {
      this.setState({ cleanHtml: false })
    } else {
      const article = await Readability.cleanHtml(response, this.url)
      if (!article) {
        this.setState({ cleanHtml: false })
      } else {
        this.setState({ cleanHtml: Readability.cleanHtmlTemplate(this.title || article.title, article.content) })
      }
    }
  }

  onNavigationStateChange = navState => {
    //Todo: this isn't called on SPA sites, need to inject some JS for that…
    const { readerMode } = this.state
    this.setState({
      canGoBack: !readerMode && navState.canGoBack,
      canGoForward: !readerMode && navState.canGoForward,
    })
  }

  onAndroidBack = () => {
    if (this.state.canGoBack) {
      this.webViewRef.goBack()
      return true
    }
    return false
  }

  onShare = () => {
    Share.share({
      ...Platform.select({
        ios: { url: this.url },
        android: { message: this.url },
      }),
      title: this.title,
    },
    {
      dialogTitle: 'Share',
    })
  }

  onReload = () => {
    this.setState({ error: false })
    this.fetchCleanHtml()
  }

  toggleReaderMode = () => {
    this.setState({ readerMode: !this.state.readerMode })
  }

  renderToolbar() {
    const { canGoBack, canGoForward, readerMode } = this.state
    return (
      <View style={s.toolbar}>
        <TouchableOpacity
          activeOpacity={0.5}
          disabled={!canGoBack}
          onPress={() => this.webViewRef.goBack()}
          style={s.button}
        >
          <Image
            source={icons.left}
            style={[s.icon, !canGoBack && s.iconDisabled]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={this.onShare}
          style={s.button}
        >
          <Image
            source={icons.share}
            style={s.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={this.toggleReaderMode}
          style={s.button}
        >
          <Image
            source={readerMode ? icons.readerMode : icons.readerModeInactive}
            style={s.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          disabled={!canGoForward}
          onPress={() => this.webViewRef.goForward()}
          style={s.button}
        >
          <Image
            source={icons.right}
            style={[s.icon, !canGoForward && s.iconDisabled]}
          />
        </TouchableOpacity>
      </View>
    )
  }

  renderError = () => {
    return (
      <View style={s.errorContainer}>
        <EmptyState
          action={ this.onReload }
          actionText={strings.common.tryAgain}
          subtitle={strings.error.tryAgainLater}
          title={strings.error.somethingWrong} />
      </View>
    )
  }

  render() {
    const { cleanHtml, readerMode, error } = this.state
    const props = {
      startInLoadingState: true,
      onNavigationStateChange: this.onNavigationStateChange,
      originWhitelist: ['*'],
      useWebKit: true,
    }
    return (
      <SafeAreaView style={s.safeArea} forceInset={{ horizontal: 'never' }}>
        <View style={s.container}>
          {readerMode && <WebView source={{ html: cleanHtml, baseUrl: this.url }} {...props} />}
          {!readerMode && <WebView ref={ref => this.webViewRef = ref} source={{ uri: this.url }} {...props} />}
          {!!error && this.renderError()}
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
  errorContainer: {
    height: '100%',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.black12,
    backgroundColor: color.white,
    paddingHorizontal: padding.medium,
    ...ifIphoneX({
      paddingTop: 12,
    }, {
      height: row.medium,
    }),
  },
  button: {
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  icon: {
    tintColor: color.blue2,
  },
  iconDisabled: {
    tintColor: color.gray1,
  },
})
