import React from 'react'
import { View, Image, WebView, StyleSheet, TouchableOpacity, Platform, BackHandler, Share } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import PropTypes from 'prop-types'
import { ifIphoneX } from 'react-native-iphone-x-helper'
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
    }
  }

  componentDidMount() {
    if (isAndroid) {
      BackHandler.addEventListener('hardwareBackPress', this.onAndroidBack)
    }
  }

  componentWillUnmount() {
    if (isAndroid) {
      BackHandler.removeEventListener('hardwareBackPress')
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
      this.webview.goBack()
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

  renderToolbar() {
    const { canGoBack, canGoForward } = this.state
    return (
      <View style={s.toolbar}>
        <TouchableOpacity
          activeOpacity={0.5}
          disabled={!canGoBack}
          onPress={() => this.webview.goBack()}
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
    const url = navigation.getParam('url')
    return (
      <SafeAreaView style={s.safeArea} forceInset={{ horizontal: 'never' }}>
        <View style={s.container}>
          <WebView
            ref={ref => this.webViewRef = ref}
            source={{ uri: url }}
            startInLoadingState={true}
            onNavigationStateChange={this.onNavigationStateChange}
            originWhitelist={['*']}
          />
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
