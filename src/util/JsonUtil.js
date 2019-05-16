export const reviver = (key, value) => {
  switch (key) {
    case 'extended':
      return value.trim()
    case 'shared':
      return value === 'yes'
    case 'toread':
      return value === 'yes'
    case 'time':
      return new Date(value)
    case 'tags':
      return value !== '' ? value.split(' ') : []
    default:
      return value
  }
}

export const replacer = (key, value) => {
  switch (key) {
    case 'shared':
      return value ? 'yes' : 'no'
    case 'toread':
      return value ? 'yes' : 'no'
    case 'time':
      return `${value.toISOString().split('.')[0]}Z`
    case 'tags':
      return value.join(' ')
    default:
      return value
  }
}
