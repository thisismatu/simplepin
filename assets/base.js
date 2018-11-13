import { Dimensions } from 'react-native'

const size = {
  fullHeight: Dimensions.get('window').height,
  fullWidth: Dimensions.get('window').width,
  rowHeight: 48,
}

const color = {
  blue1: '#E0F0FF',
  blue2: '#0066CC',
  gray1: '#E5E5E5',
  gray2: '#AAAAAA',
  gray3: '#757575',
  gray4: '#111111',
  white: '#FFFFFF',
  border: 'rgba(0,0,0,0.12)',
}

const padding = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  huge: 32,
}

const font = {
  small: 13,
  medium: 15,
  large: 17,
  huge: 20,
  bold: '600',
  regular: '400',
}

const radius = {
  small: 2,
  medium: 4,
}

export default {
  size,
  color,
  padding,
  font,
  radius,
}
