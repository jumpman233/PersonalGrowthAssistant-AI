# Git 规则

## 本机 Git 路径

当前环境里 `git` 不在默认 PATH。执行 Git 命令时使用：

```text
E:\software\Git\cmd\git.exe
```

示例：

```powershell
& "E:\software\Git\cmd\git.exe" status --short
```

## 提交信息规范

使用 Conventional Commits 结构，但摘要和正文用中文。

格式：

```text
<type>(<scope>): <中文摘要>

<中文正文，说明为什么改、改了什么、影响范围是什么>
```

示例：

```text
feat(records): 增加记录删除确认流程

新增可复用确认弹窗，用于记录删除等危险操作。

详情页和列表页删除记录前都会先弹出二次确认；列表页删除成功后只从当前前端数组移除记录，不重新拉取列表。
```

常用 type：

- feat
- fix
- refactor
- style
- docs
- test
- chore

常用 scope：

- records
- dashboard
- record-form
- tags
- weekly-review
- ai
- docs

规则：

- summary 和 body 使用中文。
- type 和 scope 使用英文。
- 写清楚用户可见行为变化。
- 涉及 API 或数据时说明影响范围。
- 不要写“优化代码”“修复问题”“update”这类空泛信息。
- 不要把多个无关主题塞进同一个 commit。

提交代码前优先运行：

```powershell
pnpm lint
pnpm build
```

只改文档时，`pnpm lint` 即可，除非文档中的示例会影响构建配置。
