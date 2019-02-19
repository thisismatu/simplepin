import React from 'react'
import { View, Image, WebView, StyleSheet, TouchableOpacity, Platform, BackHandler, Share } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import PropTypes from 'prop-types'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import Readability from 'app/util/Readability'
import Storage from 'app/util/Storage'
import NavigationButton from 'app/components/NavigationButton'
import { color, padding, row, icons } from 'app/style/style'

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
    this.state = {
      canGoBack: false,
      canGoForward: false,
      cleanHtml: undefined,
      readerMode: true,
    }
  }

  componentDidMount() {
    if (isAndroid) {
      BackHandler.addEventListener('hardwareBackPress', this.onAndroidBack)
    }
    Storage.readerMode().then(value => this.setState({ readerMode: value }))
    this.fetchUrl()
  }

  componentWillUnmount() {
    if (isAndroid) {
      BackHandler.removeEventListener('hardwareBackPress')
    }
  }

  fetchUrl = async () => {
    const { navigation } = this.props
    const url = navigation.getParam('url')
    const title = navigation.getParam('title')
    try {
      const response = await fetch(url)
      const html = await response.text()
      const article = await Readability.cleanHtml(html, url)
      if (!article) {
        this.setState({ cleanHtml: false })
      } else {
        this.setState({ cleanHtml: Readability.cleanHtmlTemplate(title || article.title, article.content) })
      }
    } catch (e) {
      console.warn(e)
    }
  }

  onNavigationStateChange = navState => {
    //Todo: this isn't called on SPA sites, need to inject some JS for that…
    this.setState({
      canGoBack: navState.canGoBack,
      canGoForward: navState.canGoForward,
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
    const { navigation } = this.props
    const title = navigation.getParam('title')
    const url = navigation.getParam('url')
    Share.share({
      ...Platform.select({
        ios: { url: url },
        android: { message: url },
      }),
      title: title,
    },
    {
      dialogTitle: 'Share',
    })
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

  render() {
    const { navigation } = this.props
    const { cleanHtml, readerMode } = this.state
    const url = navigation.getParam('url')
    const props = {
      ref: ref => this.webViewRef = ref,
      startInLoadingState: true,
      onNavigationStateChange: this.onNavigationStateChange,
      originWhitelist: ['*'],
      useWebKit: true,
    }
    return (
      <SafeAreaView style={s.safeArea} forceInset={{ horizontal: 'never' }}>
        <View style={s.container}>
          {readerMode && <WebView source={{ html: cleanHtml, baseUrl: url }} {...props} />}
          {!readerMode && <WebView source={{ url: url }} {...props} />}
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
