export interface AppNavItem {
  key: string
  label: string
  icon: string
  to?: string
  match?: string[]
  status: 'ready' | 'planned'
}

export const useAppNavigation = () => {
  const navItems: AppNavItem[] = [
    {
      key: 'dashboard',
      label: '总览',
      icon: '⌂',
      to: '/dashboard',
      match: ['/', '/dashboard'],
      status: 'ready',
    },
    {
      key: 'records',
      label: '记录',
      icon: '▤',
      to: '/records',
      match: ['/records'],
      status: 'ready',
    },
    {
      key: 'new-record',
      label: '新建记录',
      icon: '+',
      status: 'planned',
    },
    {
      key: 'weekly-review',
      label: '周复盘',
      icon: '↔',
      status: 'planned',
    },
    {
      key: 'settings',
      label: '设置',
      icon: '⌑',
      status: 'planned',
    },
  ]

  return {
    navItems,
  }
}
