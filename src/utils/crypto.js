import CryptoJS from 'crypto-js'

const SECRET_KEY = 'AI_WEB_DESK_SECRET_KEY_2024'

export function encrypt(data) {
  try {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data)
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString()
    return encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    return null
  }
}

export function decrypt(encryptedData) {
  try {
    if (!encryptedData) return null
    
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8)
    
    try {
      return JSON.parse(decryptedString)
    } catch {
      return decryptedString
    }
  } catch (error) {
    console.error('Decryption error:', error)
    return null
  }
}

export function encryptStorage() {
  return {
    setItem(key, value) {
      const encrypted = encrypt(value)
      if (encrypted !== null) {
        localStorage.setItem(key, encrypted)
      }
    },
    
    getItem(key) {
      const encrypted = localStorage.getItem(key)
      if (encrypted) {
        return decrypt(encrypted)
      }
      return null
    },
    
    removeItem(key) {
      localStorage.removeItem(key)
    },
    
    clear() {
      localStorage.clear()
    },
    
    hasItem(key) {
      return localStorage.getItem(key) !== null
    }
  }
}

export const storage = encryptStorage()
