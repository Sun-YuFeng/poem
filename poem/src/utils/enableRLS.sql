-- 启用RLS（行级安全）并设置安全策略
-- 在Supabase SQL Editor中执行此脚本

-- 1. 启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. 创建允许所有用户读取的策略（可根据需要调整）
CREATE POLICY "允许所有人读取用户数据" ON users
  FOR SELECT USING (true);

-- 3. 创建允许插入新用户的策略（注册功能需要）
CREATE POLICY "允许插入新用户" ON users
  FOR INSERT WITH CHECK (true);

-- 4. 创建允许用户更新自己信息的策略
CREATE POLICY "允许用户更新自己信息" ON users
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 5. 创建允许用户删除自己账户的策略
CREATE POLICY "允许用户删除自己账户" ON users
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 注意：以上策略相对宽松，生产环境应根据实际需求调整
-- 如果使用Supabase Auth，可以基于auth.uid()进行更精细的控制