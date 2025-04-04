import { Cache } from './utility/cache'
import { ResourceManager } from './utility/resource_manager'

export const GlobalResourceManager = new ResourceManager(new Cache())
