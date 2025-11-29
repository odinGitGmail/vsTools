#!/bin/bash
# 快速创建测试项目的脚本

# 设置测试项目路径
TEST_DIR="${1:-/tmp/vscode-extension-test}"

echo "正在创建测试项目到: $TEST_DIR"

# 创建测试目录
mkdir -p "$TEST_DIR"
cd "$TEST_DIR" || exit

# 创建 package.json
cat > package.json << 'EOF'
{
  "name": "test-project",
  "version": "0.0.1",
  "description": "测试项目"
}
EOF

# 创建 README.md
cat > README.md << 'EOF'
# 测试项目

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)

这是一个测试项目。
EOF

# 创建 .versionconfig
cat > .versionconfig << 'EOF'
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
    }
  ]
}
EOF

echo ""
echo "✓ 测试项目已创建成功！"
echo ""
echo "项目位置: $TEST_DIR"
echo ""
echo "接下来的步骤："
echo "1. 按 F5 启动扩展开发宿主"
echo "2. 在扩展开发宿主窗口中，打开文件夹: $TEST_DIR"
echo "3. 按 Ctrl+Shift+P，输入 '更新版本号' 测试插件功能"
echo ""

