export interface AppNavItem {
  key: string
  label: string
  icon: string
  to?: string
  match?: string[]
  exact?: boolean
  status: 'ready' | 'planned'
}

export const useAppNavigation = () => {
  const navItems: AppNavItem[] = [
    {
      key: 'dashboard',
      label: '总览',
      icon: '◎',
      to: '/dashboard',
      match: ['/', '/dashboard'],
      status: 'ready',
    },
    {
      key: 'records',
      label: '记录',
      icon: '□',
      to: '/records',
      match: ['/records'],
      status: 'ready',
    },
    {
      key: 'new-record',
      label: '新建记录',
      icon: '+',
      to: '/records/new',
      match: ['/records/new'],
      exact: true,
      status: 'ready',
    },
    {
      key: 'weekly-review',
      label: '周复盘',
      icon: '↗',
      to: '/review',
      match: ['/review'],
      exact: true,
      status: 'ready',
    },
    {
      key: 'settings',
      label: '设置',
      icon: '○',
      status: 'planned',
    },
  ]

  return {
    navItems,
  }
}
