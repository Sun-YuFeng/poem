-- 创建user_info表存储用户详细信息
CREATE TABLE IF NOT EXISTS user_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  nickname VARCHAR(255),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  email VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  
  -- 确保每个用户只有一条记录
  UNIQUE(user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_info_user_id ON user_info(user_id);
CREATE INDEX IF NOT EXISTS idx_user_info_email ON user_info(email);
CREATE INDEX IF NOT EXISTS idx_user_info_created_at ON user_info(created_at);

-- 插入示例数据（可选）
INSERT INTO user_info (user_id, avatar_url, nickname, gender, email, bio) VALUES 
  (
    (SELECT id FROM users WHERE username = 'admin'),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    '管理员',
    'male',
    'admin@example.com',
    '诗词网站管理员，热爱古典文学'
  ),
  (
    (SELECT id FROM users WHERE username = 'user'),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    '诗词爱好者',
    'female',
    'user@example.com',
    '热爱古典诗词，喜欢在诗词中寻找生活的诗意'
  )
ON CONFLICT (user_id) DO NOTHING;