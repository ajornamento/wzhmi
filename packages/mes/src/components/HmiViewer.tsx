// HMI 뷰어 래퍼 컴포넌트 (커스터마이징 적용)
import React, { useEffect, useState } from 'react'
import HmiCanvas from '../../../viewer/src/components/HmiCanvas.tsx'
import { useViewerStore } from '../../../viewer/src/store/viewerStore'
import type { PollFetchFn } from '../../../viewer/src/store/viewerStore'

const HMI_API_BASE = import.meta.env.VITE_HMI_API_BASE ?? 'http://localhost:3001/api/hmi'

interface HmiViewerProps {
  menuId: string
}

const HmiViewer: React.FC<HmiViewerProps> = ({ menuId }) => {
  const hmiFile = `${HMI_API_BASE}/${menuId}.json`
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setSchema, setCustomPollFn } = useViewerStore()

  useEffect(() => {
    const loadHmiFile = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(hmiFile)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setSchema(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류')
      } finally {
        setLoading(false)
      }
    }

    loadHmiFile()
  }, [hmiFile, setSchema])

  useEffect(() => {
    const loadCustomization = async () => {
      try {
        const module = await import(`../customizations/${menuId}.ts`)
        if (module.actions) {
          Object.assign(window, module.actions)
        }
        setCustomPollFn(module.fetchTagValues as PollFetchFn ?? null)
      } catch (err) {
        console.warn(`커스터마이징 로드 실패: ${menuId}`, err)
        setCustomPollFn(null)
      }
    }

    loadCustomization()
  }, [menuId, setCustomPollFn])

  if (loading) {
    return <div style={{ padding: '20px' }}>HMI 파일 로딩 중...</div>
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>오류: {error}</div>
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <HmiCanvas />
    </div>
  )
}

export default HmiViewer