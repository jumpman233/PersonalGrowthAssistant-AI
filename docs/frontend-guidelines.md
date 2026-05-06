# 开发规则
1. 请按 mobile-first responsive design 实现，不要创建 mobile/desktop 两套路由。
2. 页面层负责数据获取和模块组合。
3. 优先使用 Tailwind breakpoint 实现响应式布局。
4. 只有在交互模式明显不同的地方，才拆 DesktopXxx.vue 和 MobileXxx.vue。
5. 不要复制业务逻辑。
6. 不要用 JS 判断屏幕宽度来控制整体页面渲染。
7. 移动端/PC端适配方案遵循规则：响应式布局为主 + 少量局部组件按端差异替换
8. 不需要兼容 IE 或 iOS 8 等过旧浏览器。
9. 目标为现代浏览器。
10. 使用 Tailwind / CSS Grid / Flexbox / modern CSS。
11. 注意移动端 Safari 的 viewport、安全区和输入体验。
12. 路由文件保持薄入口，只渲染对应页面组件，例如 `dashboard.vue -> <DashboardPage />`、`records.vue -> <RecordsPage />`。
13. 同一层级路由命名保持一致；简单页面优先使用 `xxx.vue`，只有存在嵌套路由时才使用 `xxx/index.vue`。
14. 页面组件负责数据获取、筛选状态和模块组合；子组件只负责展示和局部交互。
