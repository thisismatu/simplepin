import { Platform, Share } from 'react-native'
import strings from 'app/style/strings'

export const openShareDialog = (url, title) => {
  Share.share({
    ...Platform.select({
      ios: { url: url },
      android: { message: title },
    }),
    title: title,
  },
  {
    dialogTitle: strings.common.share,
  })
}
