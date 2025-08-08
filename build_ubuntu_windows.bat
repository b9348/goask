@echo off
echo GoAsk Ubuntu版本构建工具
echo ===========================
echo.
echo 由于Wails在Windows上不支持直接交叉编译到Linux，请使用以下方法：
echo.
echo 方法1: 使用GitHub Actions (推荐)
echo --------------------------------
echo 1. 确保代码已推送到GitHub
echo 2. 访问: https://github.com/your-username/goask/actions
echo 3. 手动触发 "Build" 工作流
echo 4. 下载生成的Ubuntu版本
pause
goto end

:method2
echo 方法2: 使用WSL (Windows子系统Linux)
echo -----------------------------------
echo 1. 安装WSL: wsl --install
echo 2. 在WSL中运行: ./build_ubuntu.sh
pause
goto end

:method3
echo 方法3: 手动构建
echo ----------------
echo 1. 在Ubuntu虚拟机中运行此项目
echo 2. 执行: ./build_ubuntu.sh
pause

:end
echo 构建指南已准备完成！