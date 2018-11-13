import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/assets/Base'

const HeaderCell = ({ text }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.text}>{text}</Text>
    </View>
  )
}

HeaderCell.propTypes = {
  text: PropTypes.string.isRequired,
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: Base.size.rowHeight,
    marginTop: Base.padding.small,
    paddingHorizontal: Base.padding.medium,
  },
  text: {
    color: Base.color.gray4,
    fontSize: Base.font.large,
    fontWeight: Base.font.bold,
  },
})

export default HeaderCell
