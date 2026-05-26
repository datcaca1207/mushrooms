import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const translations = {
  en: {
    nav: {
      overview: 'Overview',
      controlPanel: 'Control Panel',
      cameraAI: 'Camera AI',
      analytics: 'Analytics',
      alerts: 'Alerts',
    },
    sidebar: {
      network: 'Network',
      industrial: 'Industrial control bus synchronized',
    },
    topBar: {
      title: 'Smart Mushroom Farm Dashboard',
      subtitle: 'SCADA + IoT Monitoring Interface',
      devices: 'Devices',
      ai: 'AI',
      language: 'Language',
    },
    panel: {
      controlPanel: 'Device Control Panel',
      scada: 'SCADA command interface for core actuators',
      realtime: 'Realtime Sensor Streams',
      live: 'LIVE',
    },
    camera: {
      title: 'Camera AI Monitoring',
      aiDetection: 'AI Detection',
      growthStage: 'Growth Stage',
      aiEngine: 'AI Engine',
      diseaseRisk: 'Disease Risk Alert',
      camLabel: 'Cam-02 | Mycelium Bay',
    },
    alerts: {
      title: 'Alert System',
      active: 'active',
      acknowledge: 'ACK',
      noAlerts: 'No active alerts. System operation within baseline envelope.',
    },
    metric: {
      temperature: 'Temperature',
      humidity: 'Humidity',
      co2: 'CO2',
      waterLevel: 'Water Level',
      deviceNetwork: 'Device Network',
      aiMonitoring: 'AI Monitoring',
      high: 'High',
      stable: 'Stable',
      low: 'Low',
      optimal: 'Optimal',
      rising: 'Rising',
      normal: 'Normal',
      refillNeeded: 'Refill Needed',
      sufficient: 'Sufficient',
      online: 'Online',
      partial: 'Partial',
      tracking: 'Tracking',
      potentialRisk: 'Potential Risk',
    },
    device: {
      online: 'ONLINE',
      offline: 'OFFLINE',
      on: 'On',
      off: 'Off',
    },
    mode: {
      auto: 'Auto',
      manual: 'Manual',
    },
    labels: {
      smartFarm: 'Smart Farm',
      mushroomNexus: 'Mushroom Nexus',
      english: 'English',
      vietnamese: 'Vietnamese',
    },
  },
  vi: {
    nav: {
      overview: 'Tổng quan',
      controlPanel: 'Bảng điều khiển',
      cameraAI: 'Camera AI',
      analytics: 'Phân tích',
      alerts: 'Cảnh báo',
    },
    sidebar: {
      network: 'Mạng',
      industrial: 'Bus điều khiển công nghiệp đồng bộ',
    },
    topBar: {
      title: 'Bảng điều khiển nông trại nấm thông minh',
      subtitle: 'Giao diện giám sát SCADA + IoT',
      devices: 'Thiết bị',
      ai: 'AI',
      language: 'Ngôn ngữ',
    },
    panel: {
      controlPanel: 'Bảng điều khiển',
      scada: 'Giao diện điều khiển các cơ cấu chấp hành',
      realtime: 'Dòng cảm biến thời gian thực',
      live: 'TRỰC TIẾP',
    },
    camera: {
      title: 'Giám sát Camera AI',
      aiDetection: 'Phát hiện AI',
      growthStage: 'Giai đoạn phát triển',
      aiEngine: 'Cơ chế AI',
      diseaseRisk: 'Cảnh báo rủi ro bệnh',
      camLabel: 'Cam-02 | Vịnh Mộc nhĩ',
    },
    alerts: {
      title: 'Hệ thống cảnh báo',
      active: 'đang hoạt động',
      acknowledge: 'XÁC NHẬN',
      noAlerts: 'Không có cảnh báo. Hệ thống hoạt động bình thường.',
    },
    metric: {
      temperature: 'Nhiệt độ',
      humidity: 'Độ ẩm',
      co2: 'CO2',
      waterLevel: 'Mức nước',
      deviceNetwork: 'Mạng thiết bị',
      aiMonitoring: 'Giám sát AI',
      high: 'Cao',
      stable: 'Ổn định',
      low: 'Thấp',
      optimal: 'Tối ưu',
      rising: 'Tăng',
      normal: 'Bình thường',
      refillNeeded: 'Cần thêm',
      sufficient: 'Đủ',
      online: 'Trực tuyến',
      partial: 'Một phần',
      tracking: 'Đang theo dõi',
      potentialRisk: 'Có nguy cơ',
    },
    device: {
      online: 'TRỰC TUYẾN',
      offline: 'NGỪNG',
      on: 'Bật',
      off: 'Tắt',
    },
    mode: {
      auto: 'Tự động',
      manual: 'Thủ công',
    },
    labels: {
      smartFarm: 'Nông trại thông minh',
      mushroomNexus: 'Mushroom Nexus',
      english: 'Tiếng Anh',
      vietnamese: 'Tiếng Việt',
    },
  },
}

const LanguageContext = createContext(null)

function resolveKey(locale, key) {
  return key.split('.').reduce((value, part) => value?.[part], translations[locale])
}

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('appLanguage') || 'en'
    }
    return 'en'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('appLanguage', locale)
    }
  }, [locale])

  const t = useMemo(
    () => (key) => {
      const translation = resolveKey(locale, key)
      return typeof translation === 'string' ? translation : key
    },
    [locale],
  )

  const toggleLanguage = () => setLocale((current) => (current === 'en' ? 'vi' : 'en'))

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export function useTranslation() {
  const { t } = useLanguage()
  return t
}
