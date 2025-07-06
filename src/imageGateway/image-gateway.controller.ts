import { Controller, Get, Post, Req, Res, Query, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './image-gateway.service';
import { Request, Response } from 'express';
import { AppConfigService, IPWhitelistService } from '../ConfigService';

// 图片代理控制器
@Controller('image')
export class ImageProxyController {
  private readonly token = 'admin';

  constructor(
    private readonly appService: AppService,
    private readonly appConfigService: AppConfigService,
    private readonly ipWhitelistService: IPWhitelistService
  ) { }

  // 动态获取允许的域名列表
  private get allowedDomains(): string[] {
    return this.appConfigService.getAllowedDomains();
  }

  // IP 白名单列表
  // 动态获取 IP 白名单列表
  private get allowedIPs(): string[] {
    return this.ipWhitelistService.getAllowedIPs();
  }

  // 验证 IP 地址
  private validateIP(ip: string): boolean {
    if (!ip) {
      return false;
    }

    // 检查是否在白名单中
    return this.allowedIPs.some(allowedIP => {
      // 如果是通配符 *，允许所有 IP
      if (allowedIP === '*') {
        return true;
      }
      // 如果是 CIDR 格式（如 192.168.0.0/16）
      if (allowedIP.includes('/')) {
        return this.isIPInRange(ip, allowedIP);
      }
      // 直接 IP 匹配
      return ip === allowedIP;
    });
  }

  // 检查 IP 是否在指定范围内
  private isIPInRange(ip: string, cidr: string): boolean {
    try {
      const [range, bits] = cidr.split('/');
      const mask = ~((1 << (32 - parseInt(bits))) - 1);
      const ipLong = this.ipToLong(ip);
      const rangeLong = this.ipToLong(range);
      return (ipLong & mask) === (rangeLong & mask);
    } catch (error) {
      return false;
    }
  }

  // IP 地址转长整型
  private ipToLong(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  // 获取真实 IP 地址
  private getRealIP(req: Request): string {
    // 按优先级获取 IP
    return req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip ||
      'unknown';
  }

  // 验证 Referer
  private validateReferer(referer: string): boolean {
    if (!referer) {
      return true; // 没有 Referer 允许访问
    }

    try {
      const url = new URL(referer);
      const host = url.hostname + (url.port ? `:${url.port}` : '');

      return this.allowedDomains.some(domain => {
        // 支持通配符匹配
        if (domain.startsWith('*.')) {
          const wildcardDomain = domain.slice(2);
          return host === wildcardDomain || host.endsWith('.' + wildcardDomain);
        }
        return host === domain;
      });
    } catch (error) {
      return false; // URL 解析失败，拒绝请求
    }
  }

  // 统一的验证函数
  private validateRequest(req: Request, res: Response, token?: string): void {
    // 1. 校验token
    if (token && token !== this.token) {
      this.setNoCacheHeaders(res);
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    // 2. 校验 IP 地址
    const realIP = this.getRealIP(req);
    if (!this.validateIP(realIP)) {
      this.setNoCacheHeaders(res);
      throw new HttpException('IP not allowed', HttpStatus.FORBIDDEN);
    }

    // 3. 校验 Referer
    const referer = req.headers.referer || req.headers.referrer;
    if (!this.validateReferer(referer as string)) {
      this.setNoCacheHeaders(res);
      throw new HttpException('Invalid Referer', HttpStatus.FORBIDDEN);
    }
  }

  // 设置不缓存响应头
  private setNoCacheHeaders(res: Response): void {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  // 配置管理接口
  @Get('config/domains')
  async getCurrentDomains() {
    return {
      success: true,
      data: {
        allowedDomains: this.allowedDomains,
        timestamp: new Date().toISOString()
      }
    };
  }

  @Get('config/ips')
  async getCurrentIPs() {
    return {
      success: true,
      data: {
        allowedIPs: this.allowedIPs,
        timestamp: new Date().toISOString()
      }
    };
  }

  @Post('config/refresh')
  async refreshConfig() {
    try {
      // 清除缓存并重新加载所有配置
      await Promise.all([
        this.appConfigService.clearCacheAndReload(),
        this.ipWhitelistService.clearCacheAndReload()
      ]);

      return {
        success: true,
        message: '配置刷新成功',
        data: {
          allowedDomains: this.allowedDomains,
          allowedIPs: this.allowedIPs,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('配置刷新失败:', error);
      return {
        success: false,
        message: '配置刷新失败，使用默认配置',
        data: {
          allowedDomains: this.allowedDomains,
          allowedIPs: this.allowedIPs,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  @Post('config/refresh/domains')
  async refreshDomainsConfig() {
    try {
      await this.appConfigService.clearCacheAndReload();
      return {
        success: true,
        message: '域名配置刷新成功',
        data: {
          allowedDomains: this.allowedDomains,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('域名配置刷新失败:', error);
      return {
        success: false,
        message: '域名配置刷新失败，使用默认配置',
        data: {
          allowedDomains: this.allowedDomains,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  @Post('config/refresh/ips')
  async refreshIPsConfig() {
    try {
      await this.ipWhitelistService.clearCacheAndReload();
      return {
        success: true,
        message: 'IP白名单配置刷新成功',
        data: {
          allowedIPs: this.allowedIPs,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('IP白名单配置刷新失败:', error);
      return {
        success: false,
        message: 'IP白名单配置刷新失败，使用默认配置',
        data: {
          allowedIPs: this.allowedIPs,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // 匹配 image/后所有路径（包括多级目录和文件名）
  @Get('*path')
  async proxyImage(
    @Req() req: Request,
    @Res() res: Response,
    @Query('token') token: string
  ) {
    // 统一验证请求
    this.validateRequest(req, res, token);

    // 获取原始图片路径（去掉 /image/ 前缀）
    const imgPath = req.path.replace(/^\/image\//, '');

    // 代理图片
    return this.appService.proxyImage(imgPath, res);
  }

  // 也支持 POST 请求
  @Post('*path')
  async proxyImagePost(
    @Req() req: Request,
    @Res() res: Response,
    @Query('token') token: string
  ) {
    // 统一验证请求
    this.validateRequest(req, res, token);

    // 获取原始图片路径（去掉 /image/ 前缀）
    const imgPath = req.path.replace(/^\/image\//, '');

    // 代理图片
    return this.appService.proxyImage(imgPath, res);
  }
}