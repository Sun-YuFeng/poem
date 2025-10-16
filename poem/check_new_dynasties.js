import { supabase } from './src/utils/supabase.js';

async function checkNewDynasties() {
  console.log('检查新朝代数据导入情况...\n');
  
  try {
    // 检查总记录数
    console.log('1. 检查总记录数...');
    const { count, error: countError } = await supabase
      .from('poems')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ 检查记录数失败:', countError);
      return;
    }
    
    console.log(`✅ 诗词总数: ${count || 0} 首\n`);
    
    if (count === 0) {
      console.log('❌ 数据库中暂无诗词数据，请先导入CSV文件\n');
      return;
    }
    
    // 检查朝代分布
    console.log('2. 检查朝代分布...');
    const { data: dynastyData, error: dynastyError } = await supabase
      .from('poems')
      .select('dynasty');
    
    if (dynastyError) {
      console.error('❌ 检查朝代分布失败:', dynastyError);
      return;
    }
    
    const dynastyCount = {};
    dynastyData.forEach(item => {
      dynastyCount[item.dynasty] = (dynastyCount[item.dynasty] || 0) + 1;
    });
    
    console.log('✅ 朝代分布:');
    Object.entries(dynastyCount).forEach(([dynasty, count]) => {
      console.log(`   ${dynasty}: ${count} 首`);
    });
    console.log('');
    
    // 检查新朝代是否已存在
    const newDynasties = ['先秦', '两汉', '魏晋', '隋', '金', '元', '明', '清'];
    const existingDynasties = Object.keys(dynastyCount);
    
    console.log('3. 检查新朝代导入情况...');
    const missingDynasties = newDynasties.filter(d => !existingDynasties.includes(d));
    const addedDynasties = newDynasties.filter(d => existingDynasties.includes(d));
    
    if (addedDynasties.length > 0) {
      console.log('✅ 已成功导入的新朝代:');
      addedDynasties.forEach(dynasty => {
        console.log(`   ${dynasty}: ${dynastyCount[dynasty]} 首诗词`);
      });
      console.log('');
    }
    
    if (missingDynasties.length > 0) {
      console.log('❌ 尚未导入的新朝代:');
      missingDynasties.forEach(dynasty => {
        console.log(`   ${dynasty}`);
      });
      console.log('');
    }
    
    // 检查新朝代的具体诗词
    console.log('4. 检查新朝代诗词示例...');
    for (const dynasty of newDynasties) {
      if (existingDynasties.includes(dynasty)) {
        const { data: poems } = await supabase
          .from('poems')
          .select('title, author')
          .eq('dynasty', dynasty)
          .limit(3);
        
        if (poems && poems.length > 0) {
          console.log(`   ${dynasty} 示例诗词:`);
          poems.forEach(poem => {
            console.log(`     - ${poem.title} (${poem.author})`);
          });
        }
      }
    }
    
    console.log('\n📊 导入总结:');
    console.log(`✅ 总诗词数量: ${count} 首`);
    console.log(`✅ 已导入新朝代: ${addedDynasties.length} 个 (${addedDynasties.join(', ')})`);
    console.log(`❌ 待导入新朝代: ${missingDynasties.length} 个 (${missingDynasties.join(', ')})`);
    
    if (missingDynasties.length === 0) {
      console.log('\n🎉 所有新朝代数据已成功导入！');
      console.log('现在朝代筛选器中将包含以下完整选项:');
      console.log('✅ 先秦, 两汉, 魏晋, 隋, 金, 元, 明, 清');
    }
    
  } catch (error) {
    console.error('检查过程中发生错误:', error);
  }
}

// 运行检查
checkNewDynasties();