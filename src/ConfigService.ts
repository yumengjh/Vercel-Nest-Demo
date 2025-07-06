import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AppConfigService implements OnModuleInit {
    private supabase: SupabaseClient;
    private allowedDomains: string[] = [];

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


        if (!supabaseUrl || !supabaseKey) {
            console.warn('Supabase 环境变量未配置，使用默认配置');
            this.allowedDomains = [
                'localhost:3000',
                'localhost:3001',
                'localhost:5000',
                'yumeng.icu',
                'www.yumeng.icu',
                'images.yumeng.icu'
            ];
            return;
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async onModuleInit() {
        await this.loadAllowedDomains();
    }

    async loadAllowedDomains() {
        // 如果没有配置 Supabase，直接返回
        if (!this.supabase) {
            console.log('使用默认配置，跳过数据库加载');
            return;
        }

        try {
            const { data, error } = await this.supabase
                .from('app_config')
                .select('value')
                .eq('key', 'allowed_domains')
                .single(); // 查询结果必须只有一行

            if (error) {
                console.error('加载配置失败:', error);
                // 保持默认配置，不重置为空数组
                return;
            } else {
                try {
                    this.allowedDomains = JSON.parse(data.value);
                    console.log('加载允许域名:', this.allowedDomains);
                } catch (e) {
                    console.error('配置 JSON 解析失败:', e);
                    // 保持默认配置，不重置为空数组
                }
            }
        } catch (error) {
            console.error('Supabase 连接失败:', error);
            // 保持默认配置
        }
    }

    getAllowedDomains(): string[] {
        return this.allowedDomains;
    }

    // 你可以再加个定时刷新配置的方法，比如每5分钟自动更新
    // 清除缓存并重新加载配置
    async clearCacheAndReload(): Promise<void> {
        console.log('🧹 清除缓存并重新加载配置...');
        // 清空当前配置
        this.allowedDomains = [];
        // 重新加载
        await this.loadAllowedDomains();
    }
}


// ------------------------------------------------------------------

@Injectable()
export class IPWhitelistService implements OnModuleInit {
  private supabase: SupabaseClient;
  private allowedIPs: string[] = [];

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase 环境变量未配置，使用默认IP白名单');
      this.allowedIPs = [
        '127.0.0.1',        // 本地回环
        '::1',              // IPv6 本地回环
        '192.168.1.100',    // 局域网 IP
        '192.168.220.1',    // 局域网 IP
        '10.0.0.0/8',       // 内网段
        '172.16.0.0/12',    // 内网段
        '192.168.0.0/16',   // 内网段
        '*'                 // 允许所有IP（开发环境）
      ];
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async onModuleInit() {
    await this.loadAllowedIPs();
  }

  async loadAllowedIPs() {
    // 如果没有配置 Supabase，直接返回
    if (!this.supabase) {
      console.log('使用默认IP白名单，跳过数据库加载');
      return;
    }

    try {
      const { data, error } = await this.supabase
        .from('ip_whitelist')
        .select('ip')
        .eq('enabled', true);

      if (error) {
        console.error('加载 IP 白名单失败:', error);
        // 保持默认配置，不重置为空数组
        return;
      } else {
        this.allowedIPs = data.map(item => item.ip);
        console.log('加载允许 IP 列表:', this.allowedIPs);
      }
    } catch (error) {
      console.error('Supabase 连接失败:', error);
      // 保持默认配置
    }
  }

  getAllowedIPs(): string[] {
    return this.allowedIPs;
  }

  // 清除缓存并重新加载IP白名单配置
  async clearCacheAndReload(): Promise<void> {
    console.log('🧹 清除IP白名单缓存并重新加载配置...');
    // 清空当前配置
    this.allowedIPs = [];
    // 重新加载
    await this.loadAllowedIPs();
  }
}


