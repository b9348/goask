@echo off
echo 正在结束 goask.exe 进程...

:: 强制结束 goask.exe 进程
taskkill /f /im goask.exe

:: 检查是否成功
if %errorlevel% == 0 (
    echo goask.exe 进程已成功结束
) else (
    echo 未找到 goask.exe 进程或结束失败
)

pause