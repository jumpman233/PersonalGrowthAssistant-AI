export type AppNavIcon = 'dashboard' | 'records' | 'new-record' | 'weekly-review'

export interface AppNavItem {
  key: string
  label: string
  icon: AppNavIcon
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
      icon: 'dashboard',
      to: '/dashboard',
      match: ['/', '/dashboard'],
      status: 'ready',
    },
    {
      key: 'records',
      label: '记录',
      icon: 'records',
      to: '/records',
      match: ['/records'],
      status: 'ready',
    },
    {
      key: 'new-record',
      label: '新建记录',
      icon: 'new-record',
      to: '/records/new',
      match: ['/records/new'],
      exact: true,
      status: 'ready',
    },
    {
      key: 'weekly-review',
      label: '周复盘',
      icon: 'weekly-review',
      to: '/review',
      match: ['/review'],
      exact: true,
      status: 'ready',
    },
  ]

  return {
    navItems,
  }
}
