import { supabase } from './src/utils/supabase.js';

async function simpleTest() {
  console.log('简单测试诗词数据...\n');
  
  try {
    // 直接获取所有诗词
    console.log('获取诗词数据...');
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('❌ 查询失败:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log(`✅ 成功获取 ${data.length} 首诗词\n`);
      console.log('前5首诗词:');
      data.slice(0, 5).forEach((poem, index) => {
        console.log(`   ${index + 1}. ${poem.title} - ${poem.author} (${poem.dynasty})`);
        console.log(`     标签: ${poem.tags ? poem.tags.join(', ') : '无'}`);
      });
    } else {
      console.log('❌ 诗词表为空，请检查数据导入');
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

simpleTest();