import { Dimensions } from 'react-native'

export const isLandscape = () => {
  const { width, height } = Dimensions.get('screen')
  return width > height
}

export const color = {
  blue1: '#E0F0FF',
  blue2: '#0066CC',
  gray0: '#F2F2F2',
  gray1: '#E5E5E5',
  gray2: '#AAAAAA',
  gray3: '#757575',
  gray4: '#111111',
  white: '#FFFFFF',
  black12: 'rgba(0,0,0,0.12)',
  black36: 'rgba(0,0,0,0.36)',
}

export const padding = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  huge: 32,
}

export const font = {
  small: 12,
  medium: 14,
  large: 16,
  huge: 20,
  bold: '600',
  regular: '400',
}

export const line = {
  small: 16,
  medium: 20,
  large: 22,
}

export const row = {
  tiny: 36,
  small: 40,
  medium: 48,
  large: 56,
}

export const radius = {
  small: 2,
  medium: 4,
  large: 8,
}

export const shadow = {
  elevation: 6,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
}

export const icons = {
  add: require('../../assets/ic-add.png'),
  all: require('../../assets/ic-all.png'),
  close: require('../../assets/ic-close.png'),
  closeSmall: require('../../assets/ic-close-small.png'),
  heart: require('../../assets/ic-heart.png'),
  left: require('../../assets/ic-left.png'),
  menu: require('../../assets/ic-menu.png'),
  message: require('../../assets/ic-message.png'),
  offlineLarge: require('../../assets/ic-offline-large.png'),
  private: require('../../assets/ic-private.png'),
  privateSmall: require('../../assets/ic-private-small.png'),
  public: require('../../assets/ic-public.png'),
  readerMode: require('../../assets/ic-reader-mode.png'),
  readerModeInactive: require('../../assets/ic-reader-mode-inactive.png'),
  right: require('../../assets/ic-right.png'),
  search: require('../../assets/ic-search.png'),
  searchLarge: require('../../assets/ic-search-large.png'),
  searchSmall: require('../../assets/ic-search-small.png'),
  settings: require('../../assets/ic-settings.png'),
  share: require('../../assets/ic-share.png'),
  simplepin: require('../../assets/ic-simplepin.png'),
  starred: require('../../assets/ic-star.png'),
  starredSmall: require('../../assets/ic-star-small.png'),
  unread: require('../../assets/ic-unread.png'),
}
