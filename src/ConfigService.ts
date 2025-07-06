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
                .single();

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
}
