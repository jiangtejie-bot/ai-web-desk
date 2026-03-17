const CONFIG_KEY = 'pageagent_config'

const defaultConfig = {
  model: 'deepseek-chat',
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: '配置你的deepseek api key',
  language: 'zh-CN',
  autoObserve: true,
  observeInterval: 500
}

export function getConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_KEY)
    if (saved) {
      return { ...defaultConfig, ...JSON.parse(saved) }
    }
  } catch (e) {
    console.error('读取配置失败:', e)
  }
  return { ...defaultConfig }
}

export function saveConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
    return true
  } catch (e) {
    console.error('保存配置失败:', e)
    return false
  }
}

export function resetConfig() {
  try {
    localStorage.removeItem(CONFIG_KEY)
    return true
  } catch (e) {
    console.error('重置配置失败:', e)
    return false
  }
}
