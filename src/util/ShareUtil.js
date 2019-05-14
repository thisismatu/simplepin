import { Platform, Share } from 'react-native'
import strings from '../style/strings'

export const showSharePostDialog = (url, title) => {
  Share.share({
    ...Platform.select({
      ios: { url: url },
      android: { message: url },
    }),
    title: title,
  },
  {
    dialogTitle: strings.common.share,
  })
}
