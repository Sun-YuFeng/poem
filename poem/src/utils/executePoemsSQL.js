import { supabase } from './supabase.js'

// 执行诗词表创建SQL
const createPoemsTable = async () => {
  console.log('开始创建诗词表...')
  
  try {
    // 创建诗词表
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS poems (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          author VARCHAR(255) NOT NULL,
          dynasty VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          tags TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );

        CREATE INDEX IF NOT EXISTS idx_poems_title ON poems(title);
        CREATE INDEX IF NOT EXISTS idx_poems_author ON poems(author);
        CREATE INDEX IF NOT EXISTS idx_poems_dynasty ON poems(dynasty);
        CREATE INDEX IF NOT EXISTS idx_poems_tags ON poems USING GIN(tags);

        ALTER TABLE poems ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "允许所有人读取诗词" ON poems;
        CREATE POLICY "允许所有人读取诗词" ON poems
        FOR SELECT USING (true);

        DROP POLICY IF EXISTS "允许认证用户管理诗词" ON poems;
        CREATE POLICY "允许认证用户管理诗词" ON poems
        FOR ALL USING (auth.role() = 'authenticated');
      `
    })

    if (error) {
      console.error('创建诗词表失败:', error)
      // 如果RPC不可用，尝试直接执行SQL
      console.log('尝试使用直接SQL执行...')
      await executeDirectSQL()
      return
    }

    console.log('诗词表创建成功！')
    
  } catch (error) {
    console.error('创建诗词表过程中发生错误:', error)
  }
}

// 直接执行SQL（如果RPC不可用）
const executeDirectSQL = async () => {
  try {
    // 由于Supabase JavaScript客户端不支持直接执行DDL，我们需要通过其他方式
    console.log('请手动在Supabase SQL Editor中执行以下SQL:')
    console.log(`
      CREATE TABLE IF NOT EXISTS poems (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        dynasty VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        tags TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
      );

      CREATE INDEX IF NOT EXISTS idx_poems_title ON poems(title);
      CREATE INDEX IF NOT EXISTS idx_poems_author ON poems(author);
      CREATE INDEX IF NOT EXISTS idx_poems_dynasty ON poems(dynasty);
      CREATE INDEX IF NOT EXISTS idx_poems_tags ON poems USING GIN(tags);

      ALTER TABLE poems ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "允许所有人读取诗词" ON poems;
      CREATE POLICY "允许所有人读取诗词" ON poems
      FOR SELECT USING (true);

      DROP POLICY IF EXISTS "允许认证用户管理诗词" ON poems;
      CREATE POLICY "允许认证用户管理诗词" ON poems
      FOR ALL USING (auth.role() = 'authenticated');
    `)
  } catch (error) {
    console.error('执行SQL失败:', error)
  }
}

// 运行创建表
createPoemsTable()