import React from 'react'
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/style/Base'

const EmptyState = (props) => {
  return (
    <View style={styles.empty}>
      { props.icon ? <Image source={props.icon} style={styles.icon} /> : null }
      <Text style={styles.title}>{props.title}</Text>
      { props.subtitle ? <Text style={styles.subtitle}>{props.subtitle}</Text> : null }
    </View>
  )
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.number,
}

const windowHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
  empty: {
    marginTop: Math.round(windowHeight / 6),
    alignItems: 'center',
    padding: Base.padding.large,
  },
  icon: {
    tintColor: Base.color.black36,
    marginBottom: Base.padding.medium,
  },
  title: {
    color: Base.color.gray4,
    fontSize: Base.font.large,
    fontWeight: Base.font.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: Base.color.gray3,
    fontSize: Base.font.medium,
    marginTop: Base.padding.small,
    lineHeight: Base.line.medium,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Base.color.blue2,
    borderRadius: Base.radius.small,
    paddingHorizontal: Base.padding.medium,
    paddingVertical: Base.padding.small,
    marginTop: Base.padding.medium,
  },
  buttonText: {
    color: Base.color.white,
    fontSize: Base.font.medium,
    lineHeight: Base.line.medium,
  },
})

export default EmptyState
