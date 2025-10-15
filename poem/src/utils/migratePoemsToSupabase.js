import { supabase } from './supabase.js'

// 将本地诗词数据迁移到Supabase
const localPoems = [
  {
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
    tags: ['抒情', '月亮', '思乡']
  },
  {
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐',
    content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
    tags: ['春天', '写景', '抒情']
  },
  {
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐',
    content: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。',
    tags: ['哲理', '励志', '写景']
  },
  {
    title: '望庐山瀑布',
    author: '李白',
    dynasty: '唐',
    content: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。',
    tags: ['写景', '山水', '豪放']
  },
  {
    title: '江雪',
    author: '柳宗元',
    dynasty: '唐',
    content: '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。',
    tags: ['冬天', '雪', '山水', '哲理']
  },
  {
    title: '相思',
    author: '王维',
    dynasty: '唐',
    content: '红豆生南国，春来发几枝。愿君多采撷，此物最相思。',
    tags: ['抒情', '爱情', '婉约']
  }
]

// 迁移函数
const migratePoems = async () => {
  console.log('开始迁移诗词数据到Supabase...')
  
  try {
    // 检查是否已存在诗词数据
    const { data: existingPoems } = await supabase
      .from('poems')
      .select('title')
      .limit(1)
    
    if (existingPoems && existingPoems.length > 0) {
      console.log('诗词数据已存在，跳过迁移')
      return
    }
    
    // 插入诗词数据
    const { data, error } = await supabase
      .from('poems')
      .insert(localPoems)
      .select()
    
    if (error) {
      console.error('迁移诗词数据失败:', error)
      return
    }
    
    console.log(`成功迁移 ${data.length} 首诗词到Supabase`)
    console.log('迁移完成！')
    
  } catch (error) {
    console.error('迁移过程中发生错误:', error)
  }
}

// 运行迁移
migratePoems()