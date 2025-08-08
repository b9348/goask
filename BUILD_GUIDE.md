# GoAsk Ubuntu版本构建指南

## 当前状态
由于Wails框架限制，Windows上无法直接交叉编译Linux版本。我们提供了多种构建方案：

## 方案1: GitHub Actions自动构建 (推荐)

### 步骤：
1. **确保代码已推送到GitHub**
   ```bash
   git add .
   git commit -m "准备Ubuntu构建"
   git push origin main
   ```

2. **手动触发构建**
   - 访问: `https://github.com/[你的用户名]/goask/actions`
   - 点击 "Build" 工作流
   - 点击 "Run workflow" → "Run workflow"

3. **下载构建结果**
   - 构建完成后，在Artifacts中下载 `goask-linux-amd64`

## 方案2: 使用WSL (Windows子系统Linux)

### 安装WSL：
```powershell
# 以管理员身份运行PowerShell
wsl --install
```

### 在WSL中构建：
```bash
# 克隆项目到WSL
wsl
cd /mnt/e/8888888888/04go/goask
chmod +x build_ubuntu.sh
./build_ubuntu.sh
```

## 方案3: 本地Ubuntu虚拟机

### 在Ubuntu中：
```bash
# 克隆项目
git clone [你的仓库地址]
cd goask

# 运行构建脚本
chmod +x build_ubuntu.sh
./build_ubuntu.sh
```

## 构建脚本说明

### build_ubuntu.sh
完整的Ubuntu构建脚本，包含：
- 系统依赖安装
- Go环境配置
- Wails安装
- 前端依赖安装
- 多架构构建(amd64/arm64)

### build_ubuntu_windows.bat
Windows下的构建指导脚本，提供可视化操作指引。

## 构建输出

构建完成后，可执行文件将位于：
```
build/bin/goask        # Linux AMD64版本
build/bin/goask-arm64  # Linux ARM64版本
```

## 验证构建

```bash
# 检查文件类型
file build/bin/goask

# 添加执行权限
chmod +x build/bin/goask

# 运行测试
./build/bin/goask --version
```

## 常见问题

1. **权限问题**: 确保脚本有执行权限
   ```bash
   chmod +x build_ubuntu.sh
   ```

2. **依赖问题**: 如果构建失败，检查系统依赖是否完整

3. **网络问题**: 在中国大陆可能需要配置代理

## 技术支持

如需帮助，请：
1. 检查GitHub Actions日志
2. 查看Wails官方文档
3. 提交Issue到项目仓库