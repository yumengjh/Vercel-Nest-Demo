@echo off
setlocal enabledelayedexpansion

REM Vercel 部署脚本 (Windows版本)
REM 使用方法: scripts\vercel.bat [命令]

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%.."

REM 颜色定义 (Windows CMD)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM 打印带颜色的消息
:print_message
echo %GREEN%[INFO]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

:print_header
echo %BLUE%=== %~1 ===%NC%
goto :eof

REM 检查是否安装了Vercel CLI
:check_vercel_cli
vercel --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Vercel CLI 未安装，请先运行: npm i -g vercel"
    exit /b 1
)
goto :eof

REM 登录Vercel
:login
call :print_header "登录 Vercel"
vercel login
goto :eof

REM 预览部署
:preview
call :print_header "预览部署"
call :print_message "正在部署到预览环境..."
vercel
call :print_message "预览部署完成！"
goto :eof

REM 生产部署
:production
call :print_header "生产部署"
call :print_warning "这将部署到生产环境，影响实际用户访问！"
set /p "confirm=确认继续吗？(y/N): "
if /i "!confirm!"=="y" (
    call :print_message "正在部署到生产环境..."
    vercel --prod
    call :print_message "生产部署完成！"
) else (
    call :print_message "部署已取消"
)
goto :eof

REM 列出部署
:list
call :print_header "部署列表"
vercel ls
goto :eof

REM 查看项目信息
:info
call :print_header "项目信息"
vercel project ls
goto :eof

REM 删除部署
:remove
call :print_header "删除部署"
call :print_warning "这将删除指定的部署！"
vercel remove
goto :eof

REM 环境变量管理
:env
call :print_header "环境变量管理"
echo 1. 查看环境变量
echo 2. 添加环境变量
echo 3. 删除环境变量
set /p "choice=请选择操作 (1-3): "

if "!choice!"=="1" (
    vercel env ls
) else if "!choice!"=="2" (
    set /p "env_name=请输入环境变量名称: "
    set /p "env_value=请输入环境变量值: "
    vercel env add !env_name! !env_value!
) else if "!choice!"=="3" (
    set /p "env_name=请输入要删除的环境变量名称: "
    vercel env rm !env_name!
) else (
    call :print_error "无效选择"
)
goto :eof

REM 本地开发
:dev
call :print_header "本地开发"
call :print_message "启动本地开发服务器..."
npm run start:dev
goto :eof

REM 构建项目
:build
call :print_header "构建项目"
call :print_message "正在构建项目..."
npm run build
call :print_message "构建完成！"
goto :eof

REM 测试
:test
call :print_header "运行测试"
call :print_message "正在运行测试..."
npm run test
call :print_message "测试完成！"
goto :eof

REM 显示帮助信息
:help
call :print_header "Vercel 部署脚本帮助"
echo 使用方法: scripts\vercel.bat [命令]
echo.
echo 可用命令:
echo   login      - 登录 Vercel
echo   preview    - 预览部署 (vercel)
echo   prod       - 生产部署 (vercel --prod)
echo   list       - 列出所有部署
echo   info       - 查看项目信息
echo   remove     - 删除部署
echo   env        - 环境变量管理
echo   dev        - 本地开发
echo   build      - 构建项目
echo   test       - 运行测试
echo   help       - 显示此帮助信息
echo.
echo 示例:
echo   scripts\vercel.bat preview    # 预览部署
echo   scripts\vercel.bat prod       # 生产部署
echo   scripts\vercel.bat env        # 管理环境变量
goto :eof

REM 主函数
:main
call :check_vercel_cli
if errorlevel 1 exit /b 1

set "command=%~1"
if "%command%"=="" set "command=help"

if "%command%"=="login" (
    call :login
) else if "%command%"=="preview" (
    call :preview
) else if "%command%"=="prod" (
    call :production
) else if "%command%"=="list" (
    call :list
) else if "%command%"=="info" (
    call :info
) else if "%command%"=="remove" (
    call :remove
) else if "%command%"=="env" (
    call :env
) else if "%command%"=="dev" (
    call :dev
) else if "%command%"=="build" (
    call :build
) else if "%command%"=="test" (
    call :test
) else (
    call :help
)

goto :eof

REM 运行主函数
call :main %* 