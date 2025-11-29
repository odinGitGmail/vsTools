# vsc_PublishAutoUpdateVersion

#### 介绍

VSCode 插件：发布自动更新版本号

#### 功能特性

- ✅ 支持多个文件配置（package.json、README.md、.csproj 等）
- ✅ 通过正则表达式精确定位版本号位置
- ✅ 支持多种版本号更新方式（Patch、Minor、Major、自定义）
- ✅ 支持多项目工作区
- ✅ 可视化选择要更新的文件
- ✅ 自动检测项目根目录（通过 .versionconfig 配置文件）

#### 软件架构

项目采用 TypeScript 开发，遵循面向对象设计原则，按功能模块化拆分：

- **types**: 类型定义
- **utils**: 工具类（配置读取、版本号处理）
- **services**: 业务服务（文件版本服务、用户交互服务）
- **extension.ts**: 扩展主入口

#### 安装教程

1. 克隆或下载本项目
2. 在项目目录下运行 `npm install` 安装依赖
3. 运行 `npm run compile` 编译项目
4. 按 `F5` 在扩展开发宿主中运行，或使用 `vsce package` 打包为 .vsix 文件

#### 使用说明

##### 1. 创建配置文件

在项目根目录下创建 `.versionconfig` 配置文件（可参考 `.versionconfig.example`）：

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

##### 2. 使用插件

**方法一：使用快捷键（推荐）**

- 按 `Ctrl+Shift+V`（Mac: `Cmd+Shift+V`）快速打开版本更新界面

**方法二：使用命令面板**

1. 在 VSCode 中打开包含 `.versionconfig` 的项目
2. 按 `Ctrl+Shift+P`（Mac: `Cmd+Shift+P`）打开命令面板
3. 输入 "更新版本号" 并选择该命令

**操作流程：**

1. 如果工作区中有多个项目，选择要更新的项目
2. 选择要更新版本号的文件（可多选，默认全选）
3. 选择版本更新方式：
   - **Patch（补丁版本）**: 例如 0.0.3 -> 0.0.4
   - **Minor（次版本）**: 例如 0.0.3 -> 0.1.0
   - **Major（主版本）**: 例如 0.0.3 -> 1.0.0
   - **自定义版本号**: 手动输入版本号
4. 确认更新

**状态栏显示：**

- 当编辑器激活文件时，右下角状态栏会显示当前项目的版本号（格式：`v1.2.3`）
- 点击状态栏可以快速打开版本更新界面
- 如果没有激活文件或找不到版本号，状态栏会自动隐藏

**使用场景：**

- 在打包前，先使用插件更新版本号
- 然后在控制台运行 `npm run build:xxx` 进行打包

##### 3. 正则表达式示例

**package.json:**

```regex
"version"\s*:\s*"([\d.]+)"
```

**README.md 版本徽章:**

```regex
!\[Version\]\(https://img\.shields\.io/badge/version-([\d.]+)-blue\.svg\)
```

**.csproj 文件:**

```regex
<Version>([\d.]+)</Version>
```

**注意**: 建议在正则表达式中使用捕获组 `([\d.]+)` 来精确捕获版本号部分。

#### 开发调试

##### 1. 环境准备

```bash
# 安装依赖
npm install

# 编译项目
npm run compile

# 监听模式编译（自动重新编译）
npm run watch
```

##### 2. 调试扩展

1. 在 VSCode 中打开本项目
2. 按 `F5` 或点击"运行和调试"面板中的"运行扩展"
3. 会打开一个新的 VSCode 窗口（扩展开发宿主）
4. 在新窗口中测试扩展功能
5. 在原始窗口中设置断点进行调试

**调试配置说明：**

- `.vscode/launch.json` 中配置了"运行扩展"调试配置
- 支持断点调试、变量查看等功能

**详细测试步骤请参考**: [测试指南.md](./测试指南.md)

##### 3. 打包扩展

**方法一：使用任务**

1. 按 `Ctrl+Shift+P`（Mac: `Cmd+Shift+P`）打开命令面板
2. 输入 "Tasks: Run Task"
3. 选择 "编译并打包" 或 "打包扩展"

**方法二：使用命令行**

```bash
# 编译并打包
npm run package

# 或直接使用 vsce
npx vsce package
```

打包完成后会在项目根目录生成 `.vsix` 文件，可以通过以下方式安装：

- 在 VSCode 中按 `Ctrl+Shift+P`，选择 "Extensions: Install from VSIX..."
- 或使用命令行：`code --install-extension publish-auto-update-version-0.0.1.vsix`

##### 4. 项目结构

详细的项目结构说明请参考 [文件结构.md](./文件结构.md)

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request

#### 特技

1.  使用 Readme_XXX.md 来支持不同的语言，例如 Readme_en.md, Readme_zh.md
2.  Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5.  Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)
