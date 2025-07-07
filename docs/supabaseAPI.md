# Supabase SQL 查询服务使用文档

## 简介

`SupabaseQueryService` 是一个将 MySQL 风格的 SQL 查询转换为 Supabase API 调用的服务。它支持基本的 SQL 操作，包括 SELECT、INSERT、UPDATE 和 DELETE，并提供了友好的错误处理机制。

## 配置

在使用服务之前，需要在环境变量中设置以下配置：

```env
SUPABASE_URL=你的Supabase项目URL
SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务角色密钥
```

## 基本用法

### 1. 注入服务

```typescript
import { SupabaseQueryService } from './databaseOperation';

@Controller()
export class YourController {
  constructor(private readonly supabaseQueryService: SupabaseQueryService) {}
}
```

### 2. 执行查询

所有的查询都通过 `executeSQL` 方法执行：

```typescript
const result = await this.supabaseQueryService.executeSQL(sqlQuery);
```

## 支持的 SQL 语句

### SELECT 查询

```sql
-- 基本查询
SELECT * FROM table_name

-- 指定字段
SELECT field1, field2 FROM table_name

-- 条件查询
SELECT * FROM table_name WHERE field = 'value'

-- 排序
SELECT * FROM table_name ORDER BY field ASC/DESC

-- 组合使用
SELECT field1, field2 FROM table_name WHERE field = 'value' ORDER BY field1 DESC
```

### INSERT 语句

```sql
-- 基本插入
INSERT INTO table_name (field1, field2) VALUES ('value1', 'value2')

-- 支持的值类型
INSERT INTO table_name (
  string_field, 
  number_field, 
  boolean_field, 
  null_field
) VALUES (
  'string',     -- 字符串（单引号或双引号）
  123,          -- 数字
  true,         -- 布尔值
  null          -- NULL值
)
```

### UPDATE 语句

```sql
-- 基本更新
UPDATE table_name SET field = 'new_value' WHERE condition

-- 条件更新
UPDATE table_name SET field = 'new_value' WHERE id = 1
UPDATE table_name SET field = 'new_value' WHERE name = 'test'
```

### DELETE 语句

```sql
-- 基本删除
DELETE FROM table_name WHERE condition

-- 条件删除
DELETE FROM table_name WHERE id = 1
DELETE FROM table_name WHERE name = 'test'
```

## WHERE 子句支持

支持以下操作符：

- `=` 等于
- `!=` 或 `<>` 不等于
- `>` 大于
- `>=` 大于等于
- `<` 小于
- `<=` 小于等于
- `LIKE` 模糊匹配
- `ILIKE` 不区分大小写的模糊匹配
- `IN` 包含
- `IS` NULL 值判断

示例：
```sql
-- 相等比较
WHERE field = 'value'
WHERE field = 123

-- 不等比较
WHERE field != 'value'
WHERE field <> 'value'

-- 范围比较
WHERE field > 100
WHERE field >= 100
WHERE field < 100
WHERE field <= 100

-- NULL 值判断
WHERE field IS NULL
```

## 值类型支持

支持以下类型的值：

1. 字符串
   - 单引号: `'string'`
   - 双引号: `"string"`
2. 数字
   - 整数: `123`
   - 浮点数: `123.45`
3. 布尔值
   - `true`
   - `false`
4. NULL
   - `null`

## 错误处理

服务会返回统一的响应格式：

```typescript
interface QueryResponse<T> {
  data: T[] | null;
  error: {
    message: string;
  } | null;
}
```

使用示例：

```typescript
const result = await this.supabaseQueryService.executeSQL(sql);
if (result.error) {
  throw new HttpException(result.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
}
return result.data;
```

## 最佳实践

1. 始终使用参数化的值，避免 SQL 注入风险
2. 为大型查询添加适当的 WHERE 子句以提高性能
3. 在处理结果时始终检查错误
4. 使用适当的引号（单引号或双引号）包裹字符串值
5. 为了更好的可读性，建议使用大写的 SQL 关键字

## 限制

1. 不支持复杂的 JOIN 操作
2. 不支持子查询
3. 不支持 GROUP BY 和聚合函数
4. 不支持事务操作
5. WHERE 子句中的 OR 条件支持有限

## 调试

服务会在控制台输出详细的错误信息，包括：
- SQL 解析错误
- 查询执行错误
- WHERE 子句解析失败

如果遇到问题，请检查：
1. SQL 语法是否正确
2. 表名和字段名是否存在
3. 值的类型是否匹配
4. WHERE 子句的格式是否正确
