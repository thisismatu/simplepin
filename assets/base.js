import {StyleSheet, Dimensions} from 'react-native'

export const dimensions = {
  fullHeight: Dimensions.get('window').height,
  fullWidth: Dimensions.get('window').width,
}

export const colors = {
  blue1: '#E0F0FF',
  blue2: '#0066CC',
  gray1: '#E5E5E5',
  gray2: '#AAAAAA',
  gray3: '#757575',
  gray4: '#111111',
  white: '#FFFFFF',
  border: 'rgba(0,0,0,0.12)',
}

export const padding = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  huge: 32,
}

export const fonts = {
  small: 13,
  medium: 15,
  large: 17,
  huge: 20,
  bold: '600',
  regular: '400',
}

export const radius = {
  small: 2,
  medium: 4,
}
