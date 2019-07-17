import { Platform, Share } from 'react-native'
import strings from '../style/strings'

const showSharePostDialog = (url, title) => {
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

export default showSharePostDialog
