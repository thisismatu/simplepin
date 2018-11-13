import React from 'react'
import { View, Image, WebView, StyleSheet, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/assets/Base'

export default class BrowserView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', ''),
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      canGoBack: false,
      canGoForward: false,
    }
  }

  onNavigationStateChange(navState) {
    this.setState({
      canGoBack: navState.canGoBack,
      canGoForward: navState.canGoForward,
    })
  }

  onBack() {
    this.webview.goBack()
  }

  onForward() {
    this.webview.goForward()
  }

  render() {
    const url = this.props.navigation.getParam('url', '')
    return (
      <View style={styles.container}>
        <WebView
          ref={ref => this.webview = ref}
          source={{ uri: url }}
          startInLoadingState={true}
          onNavigationStateChange={this.onNavigationStateChange.bind(this)}
        />
        <View style={styles.toolbar}>
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={!this.state.canGoBack}
            onPress={this.onBack.bind(this)}
            style={styles.button}
          >
            <Image
              source={require('app/assets/ic-left.png')}
              style={[styles.icon, !this.state.canGoBack && styles.iconDisabled]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={!this.state.canGoForward}
            onPress={this.onForward.bind(this)}
            style={styles.button}
          >
            <Image
              source={require('app/assets/ic-right.png')}
              style={[styles.icon, !this.state.canGoForward && styles.iconDisabled]}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

BrowserView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: Base.size.rowHeight,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Base.color.border,
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
