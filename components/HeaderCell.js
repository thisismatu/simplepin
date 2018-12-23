import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/style/Base'

export default class HeaderCell extends React.PureComponent {
  render() {
    return (
      <View style={styles.header}>
        <Text style={styles.text}>{this.props.text}</Text>
      </View>
    )
  }
}

HeaderCell.propTypes = {
  text: PropTypes.string.isRequired,
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Base.row.medium,
    marginTop: Base.padding.small,
    paddingHorizontal: Base.padding.medium,
  },
  text: {
    color: Base.color.gray4,
    fontSize: Base.font.large,
    fontWeight: Base.font.bold,
  },
})
