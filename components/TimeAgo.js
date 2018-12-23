import React from 'react'
import { Text } from 'react-native'
import PropTypes from 'prop-types'

export default class TimeAgo extends React.PureComponent {
  pluralize(number, string) {
    if (number === 1) {
      return `${number} ${string} ago`
    }
    return `${number} ${string}s ago`
  }

  format(date, exactDate) {
    if (!date) { return null }
    if (exactDate) { return date.toLocaleString() }

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
      return date.toLocaleDateString('en-EN', options)
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
