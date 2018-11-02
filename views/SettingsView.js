import React from 'react'
import {StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView, SafeAreaView} from 'react-native'
import MenuButton from 'app/components/MenuButton'
import {colors, padding, fonts} from 'app/assets/base'
import strings from 'app/assets/strings'

export default class SetingsView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: strings.menu.settings,
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
            <Switch onTintColor={colors.blue2} />
          </View>
          <View style={styles.cell}>
            <Text style={styles.text}>Unread by default</Text>
            <Switch onTintColor={colors.blue2} />
          </View>
          <View style={styles.cell}>
            <Text style={styles.text}>Mark as read when opened</Text>
            <Switch onTintColor={colors.blue2} value={true} />
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
            <Switch onTintColor={colors.blue2} />
          </View>
          <View style={styles.cell}>
            <Text style={styles.text}>Mark as read when opened</Text>
            <Switch onTintColor={colors.blue2} />
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
            <Switch onTintColor={colors.blue2} />
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
    backgroundColor: colors.white,
  },
  section: {
    paddingTop: padding.small,
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    marginHorizontal: padding.medium,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  active: {
    backgroundColor: colors.blue1,
  },
  text: {
    color: colors.gray4,
    fontSize: fonts.large,
  },
  secondary: {
    color: colors.gray3,
    fontSize: fonts.medium,
  },
  header: {
    color: colors.gray4,
    fontSize: fonts.large,
    fontWeight: fonts.bold,
  },
  version: {
    fontSize: fonts.small,
    color: colors.gray3,
    paddingVertical: padding.large,
    paddingHorizontal: padding.medium,
  }
})
