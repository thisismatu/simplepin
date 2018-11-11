import React from 'react'
import {StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView, SafeAreaView} from 'react-native'
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

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <View style={styles.cell}>
            <Text style={styles.header}>General</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.text}>Private by default</Text>
            <Switch onTintColor={Base.colors.blue2} />
          </View>
          <View style={styles.cell}>
            <Text style={styles.text}>Unread by default</Text>
            <Switch onTintColor={Base.colors.blue2} />
          </View>
          <View style={styles.cell}>
            <Text style={styles.text}>Mark as read when opened</Text>
            <Switch onTintColor={Base.colors.blue2} value={true} />
          </View>
        </View>
        <View style={styles.section}>
          <View style={styles.cell}>
            <Text style={styles.header}>Browser</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.text}>Default browser</Text>
            <Text style={styles.secondary}>Browser</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.text}>Open links in default browser</Text>
            <Switch onTintColor={Base.colors.blue2} />
          </View>
          <View style={styles.cell}>
            <Text style={styles.text}>Mark as read when opened</Text>
            <Switch onTintColor={Base.colors.blue2} />
          </View>
        </View>
        <View style={styles.section}>
          <View style={styles.cell}>
            <Text style={styles.header}>Display</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.text}>Bold bookmark titles</Text>
            <Text style={styles.secondary}>Browser</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.text}>Exact dates</Text>
            <Switch onTintColor={Base.colors.blue2} />
          </View>
          <View style={styles.cell}>
            <Text style={styles.text}>Sort tags</Text>
            <Text style={styles.secondary}>Default</Text>
          </View>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Base.colors.white,
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
    marginHorizontal: Base.padding.medium,
    borderBottomColor: Base.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  active: {
    backgroundColor: Base.colors.blue1,
  },
  text: {
    color: Base.colors.gray4,
    fontSize: Base.fonts.large,
  },
  secondary: {
    color: Base.colors.gray3,
    fontSize: Base.fonts.medium,
  },
  header: {
    color: Base.colors.gray4,
    fontSize: Base.fonts.large,
    fontWeight: Base.fonts.bold,
  },
  version: {
    fontSize: Base.fonts.small,
    color: Base.colors.gray3,
    paddingVertical: Base.padding.large,
    paddingHorizontal: Base.padding.medium,
  }
})
