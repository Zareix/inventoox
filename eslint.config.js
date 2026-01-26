//  @ts-check

import pluginQuery from '@tanstack/eslint-plugin-query'
import { tanstackConfig } from '@tanstack/eslint-config'

export default [...pluginQuery.configs['flat/recommended'], ...tanstackConfig]
