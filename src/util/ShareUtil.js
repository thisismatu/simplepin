import { Platform, Share } from 'react-native'
import strings from '../style/strings'

export const showSharePostDialog = (url, title) => {
  Share.share({
    ...Platform.select({
      ios: { url },
      android: { message: url },
    }),
    title,
  },
  {
    dialogTitle: strings.common.share,
  })
}
