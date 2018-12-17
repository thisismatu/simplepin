import React from 'react'
import { StyleSheet, View, TextInput, TouchableOpacity, Image } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/assets/Base'
import Strings from 'app/assets/Strings'

const SearchBar = (props) => {
  const icon = props.isSearchActive
    ? require('app/assets/ic-close-small.png')
    : require('app/assets/ic-search-small.png')
  return (
    <View style={styles.searchContainer}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        enablesReturnKeyAutomatically={true}
        onChange={props.onSearchChange}
        placeholder={Strings.common.search}
        placeholderTextColor = {Base.color.gray2}
        returnKeyType="search"
        style={styles.searchField}
        underlineColorAndroid="transparent"
        value={props.searchText}
      />
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => props.onSearchChange('')}
        style={styles.searchClearButton}
      >
        <Image source={icon} style={styles.searchIcon} />
      </TouchableOpacity>
    </View>
  )
}

SearchBar.propTypes = {
  isSearchActive: PropTypes.bool.isRequired,
  searchText: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
  searchContainer: {
    padding: Base.padding.small,
  },
  searchField: {
    backgroundColor: Base.color.gray0,
    color: Base.color.gray4,
    height: 32,
    paddingHorizontal: Base.padding.medium,
    borderRadius: 100,
  },
  searchClearButton: {
    width: 36,
    height: 32,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  searchIcon: {
    margin: 7,
    marginRight: 11,
    tintColor: Base.color.gray2,
  },
})

export default SearchBar