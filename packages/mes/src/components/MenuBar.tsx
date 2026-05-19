// 메뉴 바 컴포넌트
import React from 'react'
import type { UserRole } from '@wzhmi/core'
import { useViewerStore } from '../../../viewer/src/store/viewerStore'
import type { DataSourceMode } from '../../../viewer/src/store/viewerStore'

interface MenuItem {
  id: string
  name: string
}

interface MenuBarProps {
  menus: MenuItem[]
  activeMenuId: string | null
  onMenuSelect: (menuId: string) => void
}

const EDITOR_URL = 'http://localhost:5173'

const ROLES: UserRole[] = ['VIEWER', 'OPERATOR', 'ADMIN']

const ROLE_COLOR: Record<UserRole, string> = {
  VIEWER: '#6c757d',
  OPERATOR: '#007bff',
  ADMIN: '#dc3545',
}

const MenuBar: React.FC<MenuBarProps> = ({ menus, activeMenuId, onMenuSelect }) => {
  const { currentUser, setCurrentUser, dataSourceMode, setDataSourceMode, pollInterval, setPollInterval } = useViewerStore()

  return (
    <div style={{
      backgroundColor: '#f0f0f0',
      padding: '10px',
      borderBottom: '1px solid #ccc',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        {menus.map(menu => (
          <button
            key={menu.id}
            type="button"
            onClick={() => onMenuSelect(menu.id)}
            style={{
              marginRight: '10px',
              padding: '8px 16px',
              backgroundColor: activeMenuId === menu.id ? '#007bff' : '#fff',
              color: activeMenuId === menu.id ? '#fff' : '#000',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {menu.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '13px', color: '#555' }}>역할:</span>
        {ROLES.map(role => (
          <button
            key={role}
            type="button"
            onClick={() => setCurrentUser({ id: currentUser.id, role })}
            style={{
              padding: '5px 12px',
              backgroundColor: currentUser.role === role ? ROLE_COLOR[role] : '#fff',
              color: currentUser.role === role ? '#fff' : '#555',
              border: `1px solid ${ROLE_COLOR[role]}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: currentUser.role === role ? 'bold' : 'normal',
            }}
          >
            {role}
          </button>
        ))}

        <div style={{ width: 1, height: 20, backgroundColor: '#ccc', margin: '0 4px' }} />

        <span style={{ fontSize: '12px', color: '#555' }}>소스:</span>
        {(['websocket', 'polling'] as DataSourceMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setDataSourceMode(mode)}
            style={{
              padding: '5px 10px',
              backgroundColor: dataSourceMode === mode ? '#343a40' : '#fff',
              color: dataSourceMode === mode ? '#fff' : '#555',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: dataSourceMode === mode ? 'bold' : 'normal',
            }}
          >
            {mode === 'websocket' ? 'WS' : 'HTTP'}
          </button>
        ))}
        {dataSourceMode === 'polling' && (
          <>
            <span style={{ fontSize: '12px', color: '#555' }}>주기:</span>
            <select
              aria-label="폴링 주기 선택"
              value={pollInterval}
              onChange={(e) => setPollInterval(Number(e.target.value))}
              style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '4px 6px', fontSize: '12px' }}
            >
              <option value={500}>0.5s</option>
              <option value={1000}>1s</option>
              <option value={2000}>2s</option>
              <option value={5000}>5s</option>
            </select>
          </>
        )}

        <div style={{ width: 1, height: 20, backgroundColor: '#ccc', margin: '0 4px' }} />

        <button
          type="button"
          onClick={() => window.open(EDITOR_URL, '_blank')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          에디터
        </button>
      </div>
    </div>
  )
}

export default MenuBar
