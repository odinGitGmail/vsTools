# 发布自动更新版本号

![Version](https://img.shields.io/badge/version-1.0.3-blue.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.74.0-blue.svg)
![License](https://img.shields.io/badge/license-Unlicense-green.svg)
![Gitee](https://img.shields.io/badge/Gitee-odinsam%2Fvse--vs--tools-red.svg)
[![Author](https://img.shields.io/badge/author-odinsam-orange.svg)](https://www.odinsam.com)

一个强大的 VS Code 扩展，用于自动管理和更新项目中的版本号，支持多文件配置、可视化操作，并提供丰富的开发工具。

## 📋 目录

- [功能特性](#功能特性)
- [软件架构](#软件架构)
- [安装教程](#安装教程)
- [使用说明](#使用说明)
  - [创建配置文件](#1-创建配置文件)
  - [更新版本号](#2-更新版本号)
  - [状态栏功能](#3-状态栏功能)
  - [创建模板文件](#4-创建模板文件)
  - [生成更新日志](#5-生成更新日志)
- [配置说明](#配置说明)
- [正则表达式示例](#正则表达式示例)
- [开发调试](#开发调试)
- [项目结构](#项目结构)
- [参与贡献](#参与贡献)
- [许可证](#许可证)

## ✨ 功能特性

### 核心功能

- ✅ **多文件版本管理** - 支持同时管理多个文件的版本号（package.json、README.md、.csproj 等）
- ✅ **正则表达式匹配** - 通过自定义正则表达式精确定位和更新版本号位置
- ✅ **多种更新方式** - 支持 Patch、Minor、Major 和自定义版本号更新
- ✅ **多项目支持** - 支持多项目工作区，自动检测并选择项目
- ✅ **可视化操作** - 友好的界面，支持多选文件、预览版本变更

### 辅助功能

- 📊 **状态栏显示** - 实时显示当前项目的版本号
- 📝 **模板文件创建** - 快速创建 .gitignore、LICENSE、.versionconfig、CHANGELOG.md 等模板文件
- 📋 **更新日志生成** - 基于 Git 提交记录自动生成 CHANGELOG.md
- 🎯 **智能检测** - 自动检测项目根目录，支持递归查找配置文件

## 🏗 软件架构

项目采用 TypeScript 开发，遵循面向对象设计原则，按功能模块化拆分：

```
src/
├── types/                    # 类型定义
│   ├── config.ts            # 配置文件类型定义
│   └── version.ts           # 版本号相关类型定义
├── utils/                    # 工具类
│   ├── configReader.ts      # 配置文件读取工具
│   └── versionUtils.ts      # 版本号处理工具
├── services/                 # 业务服务
│   ├── fileVersionService.ts    # 文件版本服务
│   ├── userInteractionService.ts # 用户交互服务
│   ├── statusBarService.ts      # 状态栏服务
│   ├── templateService.ts       # 模板文件服务
│   ├── gitService.ts            # Git 服务
│   └── versionService.ts        # 版本服务
├── template/                 # 模板文件目录
│   ├── CHANGELOG.md
│   └── LICENSE
└── extension.ts             # 扩展主入口
```

### 设计原则

- **单一职责** - 每个类/模块只负责一个功能
- **依赖注入** - 通过参数传递依赖，便于测试
- **错误处理** - 所有可能出错的地方都有适当的错误处理
- **类型安全** - 使用 TypeScript 严格类型检查
- **可扩展性** - 通过配置文件支持任意文件类型和正则表达式

## 📦 安装教程

### 方式一：从源码安装

1. 克隆或下载本项目

   ```bash
   git clone https://gitee.com/odinsam/vse-vs-tools.git
   cd vse-vs-tools
   ```

2. 安装依赖

   ```bash
   npm install
   ```

3. 编译项目

   ```bash
   npm run compile
   ```

4. 打包扩展（可选）

   ```bash
   npm run package
   ```

5. 安装扩展
   - 在 VSCode 中按 `Ctrl+Shift+P`（Mac: `Cmd+Shift+P`）
   - 选择 "Extensions: Install from VSIX..."
   - 选择生成的 `.vsix` 文件

### 方式二：开发模式运行

1. 在 VS Code 中打开本项目
2. 按 `F5` 或点击"运行和调试"面板中的"运行扩展"
3. 会打开一个新的 VS Code 窗口（扩展开发宿主）
4. 在新窗口中测试扩展功能

## 📖 使用说明

### 1. 创建配置文件

在项目根目录下创建 `.versionconfig` 配置文件。你可以通过以下方式创建：

**方式一：使用扩展命令（推荐）**

1. 在文件资源管理器中右键点击项目根目录
2. 选择"小工具" → "创建.versionconfig 文件"
3. 扩展会自动创建配置文件模板

**方式二：手动创建**

在项目根目录下创建 `.versionconfig` 文件：

```json
{
  "files": [
    {
      "path": "package.json",
      "versionRegex": "\"version\"\\s*:\\s*\"([\\d.]+)\"",
      "description": "Node.js 项目版本号"
    },
    {
      "path": "README.md",
      "versionRegex": "!\\[Version\\]\\(https://img\\.shields\\.io/badge/version-([\\d.]+)-blue\\.svg\\)",
      "description": "README 版本徽章"
    },
    {
      "path": "src/MyProject.csproj",
      "versionRegex": "<Version>([\\d.]+)</Version>",
      "description": ".NET 项目版本号"
    }
  ]
}
```

**配置说明：**

- `path`: 文件路径（相对于项目根目录）
- `versionRegex`: 用于匹配版本号的正则表达式（建议使用捕获组 `([\\d.]+)` 来捕获版本号）
- `description`: 文件描述（可选，用于在界面中显示）

### 2. 更新版本号

#### 方式一：使用快捷键（推荐）

- 按 `Ctrl+Shift+V`（Mac: `Cmd+Shift+V`）快速打开版本更新界面

#### 方式二：使用命令面板

1. 按 `Ctrl+Shift+P`（Mac: `Cmd+Shift+P`）打开命令面板
2. 输入 "更新版本号" 并选择该命令

#### 方式三：右键菜单

1. 在文件资源管理器中右键点击 `.versionconfig` 文件
2. 选择"小工具" → "更新版本号"

#### 操作流程

1. **选择项目**（如果工作区中有多个项目）

   - 扩展会自动检测工作区中所有包含 `.versionconfig` 的项目
   - 如果有多个项目，会显示项目列表供你选择

2. **选择要更新的文件**（可多选，默认全选）

   - 扩展会列出配置文件中所有文件
   - 显示每个文件的当前版本号
   - 可以选择部分文件进行更新

3. **选择版本更新方式**

   - **Patch（补丁版本）**: 例如 `0.0.3` → `0.0.4`（修复 bug）
   - **Minor（次版本）**: 例如 `0.0.3` → `0.1.0`（新功能，向后兼容）
   - **Major（主版本）**: 例如 `0.0.3` → `1.0.0`（重大变更，可能不兼容）
   - **自定义版本号**: 手动输入版本号（如 `2.0.0-beta.1`）

4. **确认更新**

   - 显示预览信息（当前版本 → 新版本）
   - 确认后执行更新操作

5. **查看结果**
   - 显示更新成功的文件列表
   - 如果更新失败，会显示错误信息

### 3. 状态栏功能

扩展会在 VS Code 右下角状态栏显示当前项目的版本号。

- **显示格式**: `Version: x.y.z`
- **自动更新**: 当切换文件或更新版本号后，状态栏会自动刷新
- **智能隐藏**: 如果找不到项目或版本号，状态栏会显示默认文本

**使用场景：**

- 快速查看当前项目版本号
- 在编辑不同文件时，了解当前项目的版本信息

### 4. 创建模板文件

扩展提供了快速创建常用模板文件的功能。在文件资源管理器中右键点击文件夹，选择"小工具"菜单：

#### 4.1 创建 .gitignore 文件

快速创建 `.gitignore` 文件，包含常见项目的忽略规则。

**使用方法：**

1. 右键点击项目根目录
2. 选择"小工具" → "创建.gitignore 文件"
3. 如果文件已存在，会提示是否覆盖

#### 4.2 创建 LICENSE 文件

快速创建 LICENSE 文件，支持多种许可证模板。

**使用方法：**

1. 右键点击项目根目录
2. 选择"小工具" → "创建 LICENSE 文件"
3. 选择具体的许可证模板（如 `MitLicense`、`UnLicense` 等）
4. 扩展会在项目根目录创建 `LICENSE` 文件（固定文件名，无扩展名）
5. 如果文件已存在，会提示是否覆盖

**支持的许可证模板：**

- 扩展会自动检测 `src/template/license/` 目录下的所有模板文件
- 子菜单数量取决于该目录下的文件数量
- 子菜单名称对应模板文件名
- 当前支持的模板：
  - `MitLicense` - MIT 许可证
  - `UnLicense` - Unlicense 许可证

**添加自定义许可证模板：**

1. 将许可证模板文件放到 `src/template/license/` 目录
2. 在 `package.json` 中添加对应的命令和菜单配置
3. 重新编译和打包扩展

#### 4.3 创建 .versionconfig 文件

快速创建版本配置文件。

**使用方法：**

1. 右键点击项目根目录
2. 选择"小工具" → "创建.versionconfig 文件"
3. 扩展会创建包含常用配置的模板文件

#### 4.4 创建 CHANGELOG.md 文件

快速创建更新日志文件。

**使用方法：**

1. 右键点击项目根目录
2. 选择"小工具" → "创建 CHANGELOG.md 文件"
3. 如果项目是 Git 仓库，扩展会尝试从 Git 日志生成内容
4. 如果项目不是 Git 仓库，会创建空模板

### 5. 生成更新日志

扩展可以基于 Git 提交记录自动生成 CHANGELOG.md 文件。

**使用方法：**

1. 在文件资源管理器中右键点击 `CHANGELOG.md` 文件
2. 选择"小工具" → "更新日志"
3. 扩展会：
   - 查找 Git 仓库根目录
   - 读取所有 Git 提交记录
   - 生成格式化的 CHANGELOG.md 内容
   - 如果文件已存在，会提示是否覆盖

**CHANGELOG 格式：**

```markdown
# 更新日志

v1.0.0

日期: 2024-01-01

提交说明:

    初始版本发布

作者: John Doe
```

**特性：**

- **Tag 优先级最高** - 自动提取版本号，优先使用 Git Tag
  - 优先级顺序：Git Tag（最高） → 提交哈希 → 分支名
  - 使用多种方法确保能获取到 Tag：`git tag --contains`、`git describe --exact-match`、`git describe --tags`
- 按日期分组
- 显示完整的提交说明
- 包含作者信息
- 如果没有 Tag，使用提交哈希（前 8 位）作为版本号

## ⚙️ 配置说明

### 配置文件位置

配置文件必须命名为 `.versionconfig`，放在项目根目录下。扩展会从当前工作区递归查找所有 `.versionconfig` 文件。

### 配置文件格式

```json
{
  "files": [
    {
      "path": "文件路径",
      "versionRegex": "正则表达式",
      "description": "文件描述（可选）"
    }
  ]
}
```

### 字段说明

| 字段           | 类型   | 必填 | 说明                                                   |
| -------------- | ------ | ---- | ------------------------------------------------------ |
| `path`         | string | 是   | 文件路径，相对于项目根目录                             |
| `versionRegex` | string | 是   | 用于匹配版本号的正则表达式，建议包含捕获组 `([\\d.]+)` |
| `description`  | string | 否   | 文件描述，用于在界面中显示，便于识别                   |

### 路径规则

- 路径使用正斜杠 `/` 作为分隔符（跨平台兼容）
- 相对路径从项目根目录开始
- 支持子目录，如：`src/MyProject.csproj`

### 正则表达式规则

- 必须包含一个捕获组来匹配版本号，如：`([\\d.]+)`
- 使用双反斜杠 `\\` 进行转义
- 建议使用非贪婪匹配
- 示例：`"version"\\s*:\\s*"([\\d.]+)"` 可以匹配 `"version": "1.2.3"`

## 📝 正则表达式示例

### package.json

**文件内容：**

```json
{
  "name": "my-project",
  "version": "1.2.3"
}
```

**正则表达式：**

```regex
"version"\s*:\s*"([\d.]+)"
```

**配置示例：**

```json
{
  "path": "package.json",
  "versionRegex": "\"version\"\\s*:\\s*\"([\\d.]+)\"",
  "description": "Node.js 项目版本号"
}
```

### README.md 版本徽章

**文件内容：**

```markdown
![Version](https://img.shields.io/badge/version-1.2.3-blue.svg)
```

**正则表达式：**

```regex
!\[Version\]\(https://img\.shields\.io/badge/version-([\d.]+)-blue\.svg\)
```

**配置示例：**

```json
{
  "path": "README.md",
  "versionRegex": "!\\[Version\\]\\(https://img\\.shields\\.io/badge/version-([\\d.]+)-blue\\.svg\\)",
  "description": "README 版本徽章"
}
```

### .NET .csproj 文件

**文件内容：**

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <Version>1.2.3</Version>
  </PropertyGroup>
</Project>
```

**正则表达式：**

```regex
<Version>([\d.]+)</Version>
```

**配置示例：**

```json
{
  "path": "src/MyProject.csproj",
  "versionRegex": "<Version>([\\d.]+)</Version>",
  "description": ".NET 项目版本号"
}
```

### Python setup.py

**文件内容：**

```python
setup(
    name="my-project",
    version="1.2.3"
)
```

**正则表达式：**

```regex
version\s*=\s*["']([\d.]+)["']
```

**配置示例：**

```json
{
  "path": "setup.py",
  "versionRegex": "version\\s*=\\s*[\"']([\\d.]+)[\"']",
  "description": "Python 项目版本号"
}
```

## 🔧 开发调试

### 环境准备

```bash
# 安装依赖
npm install

# 编译项目
npm run compile

# 监听模式编译（自动重新编译）
npm run watch
```

### 调试扩展

1. 在 VS Code 中打开本项目
2. 按 `F5` 或点击"运行和调试"面板中的"运行扩展"
3. 会打开一个新的 VS Code 窗口（扩展开发宿主）
4. 在新窗口中测试扩展功能
5. 在原始窗口中设置断点进行调试

**调试配置说明：**

- `.vscode/launch.json` 中配置了"运行扩展"调试配置
- 支持断点调试、变量查看等功能

**详细测试步骤请参考**: [测试指南.md](https://gitee.com/odinsam/vse-vs-tools/blob/master/测试指南.md)

### 打包扩展

**方法一：使用命令行**

```bash
# 编译并打包
npm run package

# 或直接使用 vsce
npx vsce package
```

**方法二：使用任务**

1. 按 `Ctrl+Shift+P`（Mac: `Cmd+Shift+P`）打开命令面板
2. 输入 "Tasks: Run Task"
3. 选择 "编译并打包" 或 "打包扩展"

打包完成后会在项目根目录生成 `.vsix` 文件，可以通过以下方式安装：

- 在 VS Code 中按 `Ctrl+Shift+P`，选择 "Extensions: Install from VSIX..."
- 或使用命令行：`code --install-extension <extension-name>.vsix`

## 📁 项目结构

详细的项目结构说明请参考 [文件结构.md](https://gitee.com/odinsam/vse-vs-tools/blob/master/文件结构.md)

```
vse_vsTools/
├── src/                          # 源代码目录
│   ├── types/                    # 类型定义
│   │   ├── config.ts            # 配置文件类型定义
│   │   └── version.ts           # 版本号相关类型定义
│   ├── utils/                    # 工具类
│   │   ├── configReader.ts      # 配置文件读取工具
│   │   └── versionUtils.ts      # 版本号处理工具
│   ├── services/                 # 业务服务
│   │   ├── fileVersionService.ts    # 文件版本服务
│   │   ├── userInteractionService.ts # 用户交互服务
│   │   ├── statusBarService.ts      # 状态栏服务
│   │   ├── templateService.ts       # 模板文件服务
│   │   ├── gitService.ts            # Git 服务
│   │   └── versionService.ts        # 版本服务
│   ├── template/                 # 模板文件目录
│   │   ├── CHANGELOG.md          # CHANGELOG 模板
│   │   ├── LICENSE               # 默认 LICENSE 模板（向后兼容）
│   │   └── license/              # LICENSE 模板目录
│   │       ├── MitLicense        # MIT 许可证模板
│   │       └── UnLicense         # Unlicense 许可证模板
│   └── extension.ts             # 扩展主入口
├── out/                          # 编译输出目录（自动生成）
├── node_modules/                 # 依赖包（自动生成）
├── package.json                  # 扩展配置文件
├── tsconfig.json                 # TypeScript 配置
├── README.md                     # 项目说明文档
├── README.en.md                  # 英文说明文档
├── 文件结构.md                   # 项目结构说明
└── 测试指南.md                   # 测试指南
```

## 🤝 参与贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 新建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 开发规范

- 遵循现有的代码风格
- 使用 TypeScript 严格模式
- 添加适当的注释和文档
- 确保代码通过编译和测试

## 📄 许可证

本项目采用 Unlicense 许可证，详情请参阅 [LICENSE](https://gitee.com/odinsam/vse-vs-tools/blob/master/LICENSE) 文件。

## 📞 支持与反馈

如果你遇到问题或有任何建议，请：

1. 查看 [测试指南.md](https://gitee.com/odinsam/vse-vs-tools/blob/master/测试指南.md) 和 [状态栏问题排查.md](https://gitee.com/odinsam/vse-vs-tools/blob/master/状态栏问题排查.md)
2. 在 Issues 中报告问题
3. 提交 Pull Request 贡献代码

---

**开发团队**: odinsam  
**项目名称**: vscode 扩展工具  
**版本**: 1.0.1
