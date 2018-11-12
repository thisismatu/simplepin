import React from 'react'
import {StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView, SafeAreaView, Platform} from 'react-native'
import MenuButton from 'app/components/MenuButton'
import Base from 'app/assets/Base'
import Strings from 'app/assets/Strings'

export default class SetingsView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: Strings.menu.settings,
      headerLeft: (
        <MenuButton navigation={navigation} />
      )
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      switch: false,
    }
  }

  handleToggleSwitch = (evt) => {
    this.setState({
      switch: evt
    })
  }

  render() {
    const track = Platform.OS === 'android' ? Base.colors.blue2 + '88' : Base.colors.blue2
    const thumb = (enabled) => Platform.OS === 'android' && enabled ? Base.colors.blue2 : null

    return (
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <View style={styles.cell}>
            <Text style={styles.header}>General</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.cell}>
            <Text style={styles.text}>Private by default</Text>
            <Switch
              style={styles.switch}
              thumbColor={thumb(this.state.switch)}
              trackColor={{true: track}}
              onValueChange={this.handleToggleSwitch}
              value={this.state.switch}
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.cell}>
            <Text style={styles.text}>Unread by default</Text>
            <Switch
              style={styles.switch}
              thumbColor={thumb(this.state.switch)}
              trackColor={{true: track}}
              onValueChange={this.handleToggleSwitch}
              value={this.state.switch}
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.cell}>
            <Text style={styles.text}>Mark as read when opened</Text>
            <Switch
              style={styles.switch}
              thumbColor={thumb(this.state.switch)}
              trackColor={{true: track}}
              onValueChange={this.handleToggleSwitch}
              value={this.state.switch}
            />
          </View>
          <View style={styles.separator} />
        </View>

        <View style={styles.section}>
          <View style={styles.cell}>
            <Text style={styles.header}>Browser</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.cell}>
            <Text style={styles.text}>Default browser</Text>
            <Text style={styles.secondary}>Browser</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.cell}>
            <Text style={styles.text}>Open links in default browser</Text>
            <Switch
              style={styles.switch}
              thumbColor={thumb(this.state.switch)}
              trackColor={{true: track}}
              onValueChange={this.handleToggleSwitch}
              value={this.state.switch}
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.cell}>
            <Text style={styles.text}>Mark as read when opened</Text>
            <Switch
              style={styles.switch}
              thumbColor={thumb(this.state.switch)}
              trackColor={{true: track}}
              onValueChange={this.handleToggleSwitch}
              value={this.state.switch}
            />
          </View>
          <View style={styles.separator} />
        </View>

        <View style={styles.section}>
          <View style={styles.cell}>
            <Text style={styles.header}>Display</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.cell}>
            <Text style={styles.text}>Bold bookmark titles</Text>
            <Text style={styles.secondary}>Browser</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.cell}>
            <Text style={styles.text}>Exact dates</Text>
            <Switch
              style={styles.switch}
              thumbColor={thumb(this.state.switch)}
              trackColor={{true: track}}
              onValueChange={this.handleToggleSwitch}
              value={this.state.switch}
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.cell}>
            <Text style={styles.text}>Sort tags</Text>
            <Text style={styles.secondary}>Default</Text>
          </View>
          <View style={styles.separator} />
        </View>
        <Text style={styles.version}>{Strings.common.simplepin} v. XXXX</Text>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Base.colors.white,
  },
  separator: {
    borderTopColor: Base.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderStyle: 'solid',
    marginHorizontal: Base.padding.medium,
  },
  section: {
    paddingTop: Base.padding.small,
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
  text: {
    color: Base.colors.gray4,
    fontSize: Base.fonts.large,
    paddingLeft: Base.padding.medium,
  },
  switch: {
    marginRight: Platform.OS === 'android' ? 12 : Base.padding.medium,
  },
  secondary: {
    color: Base.colors.gray3,
    fontSize: Base.fonts.medium,
    paddingRight: Base.padding.medium,
  },
  header: {
    color: Base.colors.gray4,
    fontSize: Base.fonts.large,
    fontWeight: Base.fonts.bold,
    paddingHorizontal: Base.padding.medium,
  },
  version: {
    fontSize: Base.fonts.small,
    color: Base.colors.gray3,
    paddingVertical: Base.padding.large,
    paddingHorizontal: Base.padding.medium,
  },
})
