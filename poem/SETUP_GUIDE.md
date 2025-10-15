# Supabase数据库设置指南

## 1. 检查当前连接状态

运行以下命令测试Supabase连接：

```bash
cd poem
node -e "import('./src/utils/testSupabase.js')"
```

## 2. 创建数据库表

如果测试显示users表不存在，请在Supabase控制台中执行以下SQL：

### 步骤：
1. 登录 [Supabase控制台](https://supabase.com/dashboard)
2. 选择您的项目 `iieiexavhizsjywudmpw`
3. 进入 **SQL Editor**
4. 执行以下SQL脚本：

```sql
-- 创建users表
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 创建索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 插入示例数据
INSERT INTO users (username, password) VALUES 
  ('admin', '-479308479'),
  ('user', '2358688')
ON CONFLICT (username) DO NOTHING;
```

## 3. 验证设置

表创建完成后，重新运行测试脚本确认设置成功：

```bash
node -e "import('./src/utils/testSupabase.js')"
```

应该看到类似以下输出：
```
✅ Supabase连接成功，users表已存在
📊 当前用户数量: 2
```

## 4. 测试登录功能

现在可以测试应用：

1. 访问 http://localhost:5173 (开发服务器地址)
2. 使用以下测试账号登录：
   - 用户名: `admin`，密码: `-479308479`
   - 用户名: `user`，密码: `2358688`

## 5. 数据库表结构说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键，自动生成 |
| username | VARCHAR(255) | 用户名，唯一 |
| password | VARCHAR(255) | 密码（已哈希） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## 6. 安全说明

- 密码在客户端进行简单哈希处理（生产环境应使用更安全的方案）
- 使用Supabase的Row Level Security (RLS) 可以进一步增强安全性
- 建议在生产环境中启用SSL连接

## 7. 故障排除

如果遇到连接问题：

1. 检查项目ID和匿名密钥是否正确
2. 确认Supabase项目状态正常
3. 检查网络连接
4. 查看浏览器控制台错误信息

如需进一步帮助，请查看Supabase文档或联系技术支持。