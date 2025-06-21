#!/bin/bash

# Vercel 部署脚本
# 使用方法: ./scripts/vercel.sh [命令]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# 检查是否安装了Vercel CLI
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI 未安装，请先运行: npm i -g vercel"
        exit 1
    fi
}

# 登录Vercel
login() {
    print_header "登录 Vercel"
    vercel login
}

# 预览部署
preview() {
    print_header "预览部署"
    print_message "正在部署到预览环境..."
    vercel
    print_message "预览部署完成！"
}

# 生产部署
production() {
    print_header "生产部署"
    print_warning "这将部署到生产环境，影响实际用户访问！"
    read -p "确认继续吗？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_message "正在部署到生产环境..."
        vercel --prod
        print_message "生产部署完成！"
    else
        print_message "部署已取消"
    fi
}

# 列出部署
list() {
    print_header "部署列表"
    vercel ls
}

# 查看项目信息
info() {
    print_header "项目信息"
    vercel project ls
}

# 删除部署
remove() {
    print_header "删除部署"
    print_warning "这将删除指定的部署！"
    vercel remove
}

# 环境变量管理
env() {
    print_header "环境变量管理"
    echo "1. 查看环境变量"
    echo "2. 添加环境变量"
    echo "3. 删除环境变量"
    read -p "请选择操作 (1-3): " choice
    
    case $choice in
        1)
            vercel env ls
            ;;
        2)
            read -p "请输入环境变量名称: " env_name
            read -p "请输入环境变量值: " env_value
            vercel env add $env_name $env_value
            ;;
        3)
            read -p "请输入要删除的环境变量名称: " env_name
            vercel env rm $env_name
            ;;
        *)
            print_error "无效选择"
            ;;
    esac
}

# 本地开发
dev() {
    print_header "本地开发"
    print_message "启动本地开发服务器..."
    npm run start:dev
}

# 构建项目
build() {
    print_header "构建项目"
    print_message "正在构建项目..."
    npm run build
    print_message "构建完成！"
}

# 测试
test() {
    print_header "运行测试"
    print_message "正在运行测试..."
    npm run test
    print_message "测试完成！"
}

# 显示帮助信息
help() {
    print_header "Vercel 部署脚本帮助"
    echo "使用方法: ./scripts/vercel.sh [命令]"
    echo ""
    echo "可用命令:"
    echo "  login      - 登录 Vercel"
    echo "  preview    - 预览部署 (vercel)"
    echo "  prod       - 生产部署 (vercel --prod)"
    echo "  list       - 列出所有部署"
    echo "  info       - 查看项目信息"
    echo "  remove     - 删除部署"
    echo "  env        - 环境变量管理"
    echo "  dev        - 本地开发"
    echo "  build      - 构建项目"
    echo "  test       - 运行测试"
    echo "  help       - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./scripts/vercel.sh preview    # 预览部署"
    echo "  ./scripts/vercel.sh prod       # 生产部署"
    echo "  ./scripts/vercel.sh env        # 管理环境变量"
}

# 主函数
main() {
    check_vercel_cli
    
    case "${1:-help}" in
        "login")
            login
            ;;
        "preview")
            preview
            ;;
        "prod")
            production
            ;;
        "list")
            list
            ;;
        "info")
            info
            ;;
        "remove")
            remove
            ;;
        "env")
            env
            ;;
        "dev")
            dev
            ;;
        "build")
            build
            ;;
        "test")
            test
            ;;
        "help"|*)
            help
            ;;
    esac
}

# 运行主函数
main "$@" 