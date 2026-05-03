import { api } from './api'

export const systemService = {
    health: () => api.get('api/system/health/'),
    metrics: () => api.get('api/system/metrics/'),
    resources: () => api.get('api/system/resources/'),
    info: () => api.get('api/system/info/'),
}
