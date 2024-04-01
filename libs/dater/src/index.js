import dater from './dater'
import locale from '../locale/en'
import format from '../plugin/format'

dater.locale('en', locale)
dater.use(format)

dater.version = '1.0.0'

export default dater
