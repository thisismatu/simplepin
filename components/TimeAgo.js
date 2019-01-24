import React from 'react'
import { Text } from 'react-native'
import { Localization } from 'expo-localization'
import PropTypes from 'prop-types'

export default class TimeAgo extends React.PureComponent {
  localeDate = (date, exactDate) => {
    const short = { year: 'numeric', month: 'long' }
    const long = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return date.toLocaleDateString(Localization.locale, exactDate ? long : short)
  }

  pluralize = (number, string) => {
    if (number === 1) {
      return `${number} ${string} ago`
    }
    return `${number} ${string}s ago`
  }

  format = (date, exactDate) => {
    if (!date) { return null }
    if (exactDate) { return this.localeDate(date, exactDate) }

    const today = new Date()
    const seconds = Math.floor((today - date) / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const options = { year: 'numeric', month: 'long' }

    if (seconds < 60) {
      return 'just now'
    } else if (minutes < 60) {
      return this.pluralize(minutes, 'minute')
    } else if (hours < 24) {
      return this.pluralize(hours, 'hour')
    } else if (days < 7) {
      return this.pluralize(days, 'day')
    } else if (weeks < 13) {
      return this.pluralize(weeks, 'week')
    } else {
      return this.localeDate(date, exactDate)
    }
  }

  render() {
    const { style, time, exactDate } = this.props
    return (
      <Text style={style}>{this.format(time, exactDate)}</Text>
    )
  }
}

TimeAgo.propTypes = {
  time: PropTypes.object.isRequired,
  exactDate: PropTypes.bool.isRequired,
  style: PropTypes.object,
}
