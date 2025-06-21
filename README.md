# NestJS Demo Project

这是一个基于NestJS框架的演示项目，已配置为可部署到Vercel平台。

## 项目API接口

### 基础信息
- **控制器路径**: `/cats` (所有接口都在这个路径下)
- **服务端口**: 3000 (默认)

### 具体API接口

1. **GET `/cats/breed`**
   - 获取猫咪品种信息
   - 返回: "Hello World!"

2. **GET `/cats/breed/*`** (通配符路由)
   - 创建新猫咪
   - HTTP状态码: 204
   - 重定向到: https://nest.nodejs.cn

3. **GET `/cats/docs`**
   - 获取文档
   - 查询参数: `version` (可选)
   - 重定向逻辑:
     - `version=5`: 重定向到 https://nest.nodejs.cn/v5/
     - 其他: 重定向到 https://nest.nodejs.cn

4. **GET `/cats/init`**
   - 预热接口，用于减少冷启动时间
   - 返回系统状态信息：
     - `status`: 服务状态
     - `env`: 运行环境
     - `vercel`: 是否在Vercel环境
     - `ip`: 用户的IP地址
     - `x-forwarded-for`: 代理转发的IP地址
     - `timestamp`: 当前时间戳
     - `version`: 应用版本
     - `uptime`: 运行时间
     - `memory`: 内存使用情况

## 本地开发

```bash
# 安装依赖
npm install

# 开发模式运行
npm run start:dev

# 构建项目
npm run build

# 生产模式运行
npm run start:prod
```

## Vercel部署

### 方法1: 使用便捷脚本 (推荐)

#### Windows PowerShell:
```powershell
# 预览部署
.\scripts\vercel.ps1 preview

# 生产部署
.\scripts\vercel.ps1 prod

# 查看帮助
.\scripts\vercel.ps1 help
```

#### Windows CMD:
```cmd
# 预览部署
scripts\vercel.bat preview

# 生产部署
scripts\vercel.bat prod

# 查看帮助
scripts\vercel.bat help
```

#### Linux/Mac:
```bash
# 给脚本执行权限
chmod +x scripts/vercel.sh

# 预览部署
./scripts/vercel.sh preview

# 生产部署
./scripts/vercel.sh prod

# 查看帮助
./scripts/vercel.sh help
```

### 方法2: 使用npm脚本

```bash
# 预览部署
npm run deploy:preview

# 生产部署
npm run deploy:prod

# 登录Vercel
npm run vercel:login

# 查看部署列表
npm run vercel:list

# 查看项目信息
npm run vercel:info

# 管理环境变量
npm run vercel:env
```

### 方法3: 使用Vercel CLI

1. 确保已安装Vercel CLI:
```bash
npm i -g vercel
```

2. 登录Vercel:
```bash
vercel login
```

3. 部署项目:
```bash
vercel
```

4. 生产环境部署:
```bash
vercel --prod
```

### 方法4: 通过GitHub集成

1. 将代码推送到GitHub仓库
2. 在Vercel控制台导入GitHub仓库
3. Vercel会自动检测NestJS项目并配置部署

## 脚本功能说明

### 可用命令:
- `login` - 登录Vercel账户
- `preview` - 预览部署 (vercel)
- `prod` - 生产部署 (vercel --prod)
- `list` - 列出所有部署
- `info` - 查看项目信息
- `remove` - 删除部署
- `env` - 环境变量管理
- `dev` - 本地开发
- `build` - 构建项目
- `test` - 运行测试
- `help` - 显示帮助信息

### 环境变量配置

在Vercel控制台中可以设置以下环境变量：
- `PORT`: 服务端口 (Vercel会自动设置)
- 其他自定义环境变量

## 部署后的API访问

部署成功后，您的API将在以下地址可用：
- `https://your-project-name.vercel.app/cats/breed`
- `https://your-project-name.vercel.app/cats/docs`
- `https://your-project-name.vercel.app/cats/breed/任意路径`

## 注意事项

1. Vercel的无服务器函数有执行时间限制（默认10秒，已配置为30秒）
2. 确保所有依赖都在`package.json`中正确声明
3. 静态文件应放在`public`目录中
4. 数据库连接等需要持久化的服务需要单独配置

## 故障排除

如果部署遇到问题：
1. 检查`vercel.json`配置是否正确
2. 确保所有依赖都已安装
3. 查看Vercel部署日志
4. 确保代码中没有使用本地文件系统操作
5. 使用脚本的`help`命令查看详细帮助

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 本地测试
npm run start:dev

# 3. 登录Vercel
npm run vercel:login

# 4. 预览部署
npm run deploy:preview

# 5. 生产部署
npm run deploy:prod
```
