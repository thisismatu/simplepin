import React from 'react'
import { Text } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import PropTypes from 'prop-types'
import moment from 'moment'

const deviceLocale = DeviceInfo.getDeviceLocale()
const preferredLocales = DeviceInfo.getPreferredLocales()
const locale = preferredLocales.length > 0 ? preferredLocales[0] : deviceLocale
moment.locale(locale)

export default class TimeAgo extends React.PureComponent {
  pluralize = (number, string) => {
    if (number === 1) {
      return `${number} ${string} ago`
    }
    return `${number} ${string}s ago`
  }

  format = date => {
    if (!date) { return null }

    const today = new Date()
    const seconds = Math.floor((today - date) / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)

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
      return moment(date).format('MMMM Y')
    }
  }

  render() {
    const { style, time, exactDate } = this.props
    if (exactDate) {
      return <Text style={style}>{moment(time).format('L LT')}</Text>
    }
    return (
      <Text style={style}>{this.format(time)}</Text>
    )
  }
}

TimeAgo.propTypes = {
  time: PropTypes.object.isRequired,
  exactDate: PropTypes.bool.isRequired,
  style: PropTypes.object,
}
