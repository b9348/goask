#!/bin/bash
# Ubuntu构建脚本 - 在Ubuntu或WSL环境中运行

echo "开始构建GoAsk Ubuntu版本..."

# 更新系统包
sudo apt-get update

# 安装构建依赖
sudo apt-get install -y \
    build-essential \
    pkg-config \
    libgtk-3-dev \
    libwebkit2gtk-4.1-dev \
    golang-go \
    npm

# 检查Go版本
echo "Go版本:"
go version

# 检查Node.js版本
echo "Node.js版本:"
node --version

# 安装Wails
echo "安装Wails..."
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# 确保Wails在PATH中
export PATH=$PATH:$(go env GOPATH)/bin

# 构建前端依赖
echo "安装前端依赖..."
cd frontend
npm install

# 返回项目根目录
cd ..

# 构建应用
echo "构建Linux AMD64版本..."
wails build -platform linux/amd64 -clean

# 构建ARM64版本（可选）
echo "构建Linux ARM64版本..."
wails build -platform linux/arm64 -clean

# 检查构建结果
echo "构建完成，检查输出文件:"
ls -la build/bin/

echo "Ubuntu版本构建完成！"