# 编码与中文乱码规避

## 背景

本项目包含大量中文产品文案、中文测试断言、中文 Markdown 和 Vue template。Windows / PowerShell 环境下如果用默认编码读写文件，容易把 UTF-8 中文固化成乱码，例如 `锛`、`鐨`、`璁`、`鎴`、`鈫`。

## 必须遵守

- 仓库文本文件默认按 UTF-8 处理。
- 不要使用 GBK、ANSI 或系统默认编码重写包含中文的文件。
- 不要把 PowerShell 终端里显示出来的中文当作唯一可信来源。
- 如果终端输出出现乱码特征，禁止直接复制回代码或文档。
- 修改中文密集文件前，先确认自己看到的是正常中文，而不是 mojibake。

## 推荐编辑方式

- 手工改文件优先使用 `apply_patch`。
- 脚本化改中文文件时使用 Node：

```js
import { readFileSync, writeFileSync } from 'node:fs'

const text = readFileSync(path, 'utf8')
writeFileSync(path, nextText, 'utf8')
```

- 如果必须用 PowerShell 写中文文件，必须显式指定 UTF-8 编码，并在写入后验证文件内容。

## 避免使用

避免用以下方式写入包含中文的文件：

- `Set-Content` 不指定编码
- `Out-File` 不指定编码
- `>` / `>>` 重定向中文文本
- 从乱码终端输出复制文本再写回文件

## 修改后检查

涉及中文文案、中文注释、中文测试断言、Markdown、Vue template 或服务端返回文案的改动，完成后必须扫描本次改动范围内是否残留乱码特征。

重点扫描：

```text
锛|鐨|璁|鎴|鍐|鍛|杩|涓|浣|鈫|鈻|鈼|鉁|�
```

PowerShell 示例：

```powershell
Get-ChildItem app,server,tests,docs,skills -Recurse -Include *.ts,*.vue,*.md |
  Select-String -Pattern '锛','鐨','璁','鎴','鍐','鍛','鈫','鈻','鉁','�'
```

## 修复原则

- 发现已有乱码时，按产品语义恢复成正常中文。
- 不要盲目做整文件编码转换，除非已确认文件字节本身只是被错误解码。
- 不要把乱码字符串作为测试期望值。
- 如果 UI 文案恢复为正常中文，相关 E2E / 单测断言也必须同步恢复为正常中文。

## 验证建议

- 文案类改动至少跑相关单测或 E2E。
- Dashboard、记录详情、记录表单、周复盘这类中文密集页面，改完后优先打开页面或跑对应 E2E。
