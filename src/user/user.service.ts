import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseQueryService } from '../databaseOperation';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    private readonly SALT_ROUNDS = 10;

    constructor(
        private readonly supabaseQueryService: SupabaseQueryService,
        private readonly jwtService: JwtService
    ) { }

    async getUserList() {
        return await this.supabaseQueryService.executeSQL(
            `SELECT username,uuid FROM users`
        );
    }

    async register(body: any, req: any) {
        const {
            username,
            password,
            email = null,
            gender = 'other',
            age = null,
            role = 'user',
            bio = null,
            avatar_url = null,
            phone = null,
            address = null
        } = body;

        const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

        let register_ip = null;
        if (req && req.ip) {
            register_ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
        }

        const sql = `
      INSERT INTO users (
        username, password, email, gender, age, role, is_active, is_banned, bio, avatar_url, phone, register_ip,address
      ) VALUES (
        '${username}', 
        '${hashedPassword}', 
        ${email ? `'${email}'` : 'NULL'}, 
        '${['male', 'female', 'other'].includes(gender) ? gender : 'other'}', 
        ${age !== null && !isNaN(Number(age)) ? Number(age) : 'NULL'}, 
        '${['admin', 'editor', 'user'].includes(role) ? role : 'user'}', 
        true, 
        false, 
        ${bio ? `'${bio}'` : 'NULL'}, 
        ${avatar_url ? `'${avatar_url}'` : 'NULL'}, 
        ${phone ? `'${phone}'` : 'NULL'}, 
        ${register_ip ? `'${register_ip}'` : 'NULL'}, 
        ${address ? `'${address}'` : 'NULL'}
      )
    `;

        return await this.supabaseQueryService.executeSQL(sql);
    }

    async updateUserInfo(body: any) {
        let whereClause = '';
        if (body.uuid) {
            whereClause = `uuid = '${body.uuid}'`;
        }
        else if (body.phone) {
            whereClause = `phone = '${body.phone}'`;
        } else if (body.email) {
            whereClause = `email = '${body.email}'`;
        } else {
            throw new HttpException('请提供手机号或邮箱用于更新用户信息', HttpStatus.BAD_REQUEST);
        }

        const sql = `UPDATE users SET ${body.key} = '${body.value}' WHERE ${whereClause}`;
        return await this.supabaseQueryService.executeSQL(sql);
    }

    async login(body: any, req: any) {
        const result = await this.supabaseQueryService.executeSQL(
            `SELECT * FROM users WHERE username = '${body.username}'`
        );

        if (result.data.length === 0) {
            throw new HttpException('用户名错误或不存在', HttpStatus.UNAUTHORIZED);
        }

        const user = result.data[0];
        const isPasswordValid = await bcrypt.compare(body.password, user.password);

        if (!isPasswordValid) {
            throw new HttpException('密码错误', HttpStatus.UNAUTHORIZED);
        }

        const sql = `UPDATE users SET last_active_ip = '${req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim()}', last_active_at = '${new Date().toISOString()}' WHERE uuid = '${user.uuid}'`;
        await this.supabaseQueryService.executeSQL(sql);

        const token = this.jwtService.sign({
            uuid: user.uuid,
            gender: user.gender,
            age: user.age,
            phone: user.phone,
            email: user.email,
            roles: user.role
        });

        return {
            status: 200,
            message: '登录成功',
            data: {
                uuid: user.uuid,
                username: user.username,
                avatar: user.avatar_url,
                nickname: user.bio,
                roles: user.role,
                ip: req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim(),
                last_active_at: new Date().toISOString(),
                token
            }
        };
    }

    async deleteUser(body: any) {
        return await this.supabaseQueryService.executeSQL(
            `DELETE FROM users WHERE id = ${body.id}`
        );
    }
} 