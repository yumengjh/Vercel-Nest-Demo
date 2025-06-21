# Vercel 部署脚本 (PowerShell版本)
# 使用方法: .\scripts\vercel.ps1 [命令]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# 设置错误处理
$ErrorActionPreference = "Stop"

# 颜色函数
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Color = "Green"
    )
    Write-Host "[INFO] $Message" -ForegroundColor $Color
}

function Write-ColorWarning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-ColorError {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-ColorHeader {
    param([string]$Message)
    Write-Host "=== $Message ===" -ForegroundColor Cyan
}

# 检查是否安装了Vercel CLI
function Test-VercelCLI {
    try {
        $null = Get-Command vercel -ErrorAction Stop
        return $true
    }
    catch {
        Write-ColorError "Vercel CLI 未安装，请先运行: npm i -g vercel"
        return $false
    }
}

# 登录Vercel
function Invoke-VercelLogin {
    Write-ColorHeader "登录 Vercel"
    vercel login
}

# 预览部署
function Invoke-VercelPreview {
    Write-ColorHeader "预览部署"
    Write-ColorMessage "正在部署到预览环境..."
    vercel
    Write-ColorMessage "预览部署完成！"
}

# 生产部署
function Invoke-VercelProduction {
    Write-ColorHeader "生产部署"
    Write-ColorWarning "这将部署到生产环境，影响实际用户访问！"
    $confirm = Read-Host "确认继续吗？(y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        Write-ColorMessage "正在部署到生产环境..."
        vercel --prod
        Write-ColorMessage "生产部署完成！"
    } else {
        Write-ColorMessage "部署已取消"
    }
}

# 列出部署
function Get-VercelDeployments {
    Write-ColorHeader "部署列表"
    vercel ls
}

# 查看项目信息
function Get-VercelProjectInfo {
    Write-ColorHeader "项目信息"
    vercel project ls
}

# 删除部署
function Remove-VercelDeployment {
    Write-ColorHeader "删除部署"
    Write-ColorWarning "这将删除指定的部署！"
    vercel remove
}

# 环境变量管理
function Manage-VercelEnvironment {
    Write-ColorHeader "环境变量管理"
    Write-Host "1. 查看环境变量"
    Write-Host "2. 添加环境变量"
    Write-Host "3. 删除环境变量"
    $choice = Read-Host "请选择操作 (1-3)"
    
    switch ($choice) {
        "1" { vercel env ls }
        "2" { 
            $envName = Read-Host "请输入环境变量名称"
            $envValue = Read-Host "请输入环境变量值"
            vercel env add $envName $envValue
        }
        "3" { 
            $envName = Read-Host "请输入要删除的环境变量名称"
            vercel env rm $envName
        }
        default { Write-ColorError "无效选择" }
    }
}

# 本地开发
function Start-LocalDevelopment {
    Write-ColorHeader "本地开发"
    Write-ColorMessage "启动本地开发服务器..."
    npm run start:dev
}

# 构建项目
function Build-Project {
    Write-ColorHeader "构建项目"
    Write-ColorMessage "正在构建项目..."
    npm run build
    Write-ColorMessage "构建完成！"
}

# 测试
function Test-Project {
    Write-ColorHeader "运行测试"
    Write-ColorMessage "正在运行测试..."
    npm run test
    Write-ColorMessage "测试完成！"
}

# 显示帮助信息
function Show-Help {
    Write-ColorHeader "Vercel 部署脚本帮助"
    Write-Host "使用方法: .\scripts\vercel.ps1 [命令]"
    Write-Host ""
    Write-Host "可用命令:"
    Write-Host "  login      - 登录 Vercel"
    Write-Host "  preview    - 预览部署 (vercel)"
    Write-Host "  prod       - 生产部署 (vercel --prod)"
    Write-Host "  list       - 列出所有部署"
    Write-Host "  info       - 查看项目信息"
    Write-Host "  remove     - 删除部署"
    Write-Host "  env        - 环境变量管理"
    Write-Host "  dev        - 本地开发"
    Write-Host "  build      - 构建项目"
    Write-Host "  test       - 运行测试"
    Write-Host "  help       - 显示此帮助信息"
    Write-Host ""
    Write-Host "示例:"
    Write-Host "  .\scripts\vercel.ps1 preview    # 预览部署"
    Write-Host "  .\scripts\vercel.ps1 prod       # 生产部署"
    Write-Host "  .\scripts\vercel.ps1 env        # 管理环境变量"
}

# 主函数
function Main {
    if (-not (Test-VercelCLI)) {
        exit 1
    }
    
    switch ($Command.ToLower()) {
        "login" { Invoke-VercelLogin }
        "preview" { Invoke-VercelPreview }
        "prod" { Invoke-VercelProduction }
        "list" { Get-VercelDeployments }
        "info" { Get-VercelProjectInfo }
        "remove" { Remove-VercelDeployment }
        "env" { Manage-VercelEnvironment }
        "dev" { Start-LocalDevelopment }
        "build" { Build-Project }
        "test" { Test-Project }
        "help" { Show-Help }
        default { 
            Write-ColorError "未知命令: $Command"
            Show-Help
        }
    }
}

# 运行主函数
Main 