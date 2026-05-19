// MES 화면 메인 앱 컴포넌트
import React, { useState } from 'react'
import MenuBar from './components/MenuBar'
import HmiViewer from './components/HmiViewer'
import menuConfig from '../config/menu-config.json'

const App: React.FC = () => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const activeMenu = menuConfig.find(menu => menu.id === activeMenuId)

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MenuBar
        menus={menuConfig}
        activeMenuId={activeMenuId}
        onMenuSelect={setActiveMenuId}
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeMenu ? (
          <HmiViewer menuId={activeMenu.id} />
        ) : (
          <div style={{ padding: '20px' }}>
            메뉴를 선택하세요
          </div>
        )}
      </div>
    </div>
  )
}

export default App