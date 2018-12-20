import React from 'react'
import { StyleSheet, View, TextInput, TouchableOpacity, Image } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/style/Base'
import Icons from 'app/style/Icons'
import Strings from 'app/style/Strings'

const SearchBar = (props) => {
  const icon = props.isSearchActive ? Icons.closeSmall : Icons.searchSmall
  return (
    <View style={styles.container}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        enablesReturnKeyAutomatically={true}
        onChange={props.onSearchChange}
        placeholder={Strings.common.search}
        placeholderTextColor = {Base.color.gray2}
        returnKeyType="search"
        style={styles.textField}
        underlineColorAndroid="transparent"
        value={props.searchText}
      />
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => props.onSearchChange('')}
        style={styles.button}
        disabled={!props.searchText}
      >
        <Image source={icon} style={styles.icon} />
      </TouchableOpacity>
    </View>
  )
}

SearchBar.propTypes = {
  isSearchActive: PropTypes.bool.isRequired,
  searchText: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
}

const barHeight = Base.row.tiny
const barVerticalMargin = 12
const barTopMargin = Base.padding.medium
const iconSize = 18

const styles = StyleSheet.create({
  container: {
    backgroundColor: Base.color.white,
    paddingBottom: Base.padding.tiny,
    paddingHorizontal: barVerticalMargin,
    paddingTop: barTopMargin,
  },
  textField: {
    backgroundColor: Base.color.gray0,
    borderRadius: 100,
    color: Base.color.gray4,
    height: barHeight,
    paddingHorizontal: Base.padding.medium,
  },
  button: {
    height: barHeight,
    padding: (barHeight - iconSize) / 2,
    position: 'absolute',
    right: barVerticalMargin,
    top: barTopMargin,
    width: barHeight,
  },
  icon: {
    marginLeft: - barVerticalMargin / 4,
    tintColor: Base.color.black36,
  },
})

export default SearchBar