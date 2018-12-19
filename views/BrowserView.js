import React from 'react'
import { SafeAreaView, View, Image, WebView, StyleSheet, TouchableOpacity, Platform, BackHandler } from 'react-native'
import PropTypes from 'prop-types'
import CloseButton from 'app/components/CloseButton'
import Base from 'app/style/Base'
import Icons from 'app/style/Icons'

const isAndroid = Platform.OS === 'android'

export default class BrowserView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', ''),
      headerLeft: <CloseButton onPress={() => navigation.dismiss()} />,
    }
  }

  constructor(props) {
    super(props)
    this.state = {
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

  renderToolbar() {
    return (
      <View style={styles.toolbar}>
        <TouchableOpacity
          activeOpacity={0.5}
          disabled={!this.state.canGoBack}
          onPress={() => this.webview.goBack()}
          style={styles.button}
        >
          <Image
            source={Icons.left}
            style={[styles.icon, !this.state.canGoBack && styles.iconDisabled]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          disabled={!this.state.canGoForward}
          onPress={() => this.webview.goForward()}
          style={styles.button}
        >
          <Image
            source={Icons.right}
            style={[styles.icon, !this.state.canGoForward && styles.iconDisabled]}
          />
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <WebView
            ref={ref => this.webview = ref}
            source={{ uri: this.state.url }}
            startInLoadingState={true}
            onNavigationStateChange={this.onNavigationStateChange}
          />
          { isAndroid ? null : this.renderToolbar() }
        </View>
      </SafeAreaView>
    )
  }
}

BrowserView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
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
    height: 40,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Base.color.black12,
    backgroundColor: Base.color.white,
    paddingHorizontal: Base.padding.medium,
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
