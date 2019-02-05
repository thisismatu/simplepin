import React from 'react'
import { SafeAreaView, View, Image, WebView, StyleSheet, TouchableOpacity, Platform, BackHandler, Share } from 'react-native'
import PropTypes from 'prop-types'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import NavigationButton from 'app/components/NavigationButton'
import Base from 'app/style/Base'
import Icons from 'app/style/Icons'

const isAndroid = Platform.OS === 'android'

export default class BrowserView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', ''),
      headerLeft: <NavigationButton onPress={() => navigation.dismiss()} icon={Icons.close} />,
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      title: this.props.navigation.getParam('title', ''),
      url: this.props.navigation.getParam('url', ''),
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

  onNavigationStateChange = (navState) => {
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
    Share.share({
      ...Platform.select({
        ios: { url: this.state.url },
        android: { message: this.state.url },
      }),
      title: this.state.title,
    },
    {
      dialogTitle: 'Share',
    })
  }

  renderToolbar() {
    return (
      <View style={s.toolbar}>
        <TouchableOpacity
          activeOpacity={0.5}
          disabled={!this.state.canGoBack}
          onPress={() => this.webview.goBack()}
          style={s.button}
        >
          <Image
            source={Icons.left}
            style={[s.icon, !this.state.canGoBack && s.iconDisabled]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={this.onShare}
          style={s.button}
        >
          <Image
            source={Icons.share}
            style={s.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          disabled={!this.state.canGoForward}
          onPress={() => this.webview.goForward()}
          style={s.button}
        >
          <Image
            source={Icons.right}
            style={[s.icon, !this.state.canGoForward && s.iconDisabled]}
          />
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.container}>
          <WebView
            ref={ref => this.webview = ref}
            source={{ uri: this.state.url }}
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
    backgroundColor: Base.color.white,
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
    borderTopColor: Base.color.black12,
    backgroundColor: Base.color.white,
    paddingHorizontal: Base.padding.medium,
    ...ifIphoneX({
      paddingTop: 12,
    }, {
      height: Base.row.medium,
    }),
  },
  button: {
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  icon: {
    tintColor: Base.color.blue2,
  },
  iconDisabled: {
    tintColor: Base.color.gray1,
  },
})
