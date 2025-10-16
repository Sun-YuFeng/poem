import { supabase } from './src/utils/supabase.js';

async function verifyImport() {
  console.log('开始验证诗词数据导入...\n');
  
  try {
    // 1. 检查总记录数
    console.log('1. 检查总记录数...');
    const { data: countData, error: countError } = await supabase
      .from('poems')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ 检查记录数失败:', countError);
      return;
    }
    
    console.log(`✅ 诗词总数: ${countData ? countData.length : 0} 首\n`);
    
    // 2. 检查前5条记录
    console.log('2. 检查前5条记录...');
    const { data: poemsData, error: poemsError } = await supabase
      .from('poems')
      .select('*')
      .limit(5);
    
    if (poemsError) {
      console.error('❌ 获取诗词数据失败:', poemsError);
      return;
    }
    
    if (poemsData && poemsData.length > 0) {
      console.log('✅ 前5条记录:');
      poemsData.forEach((poem, index) => {
        console.log(`   ${index + 1}. ${poem.title} - ${poem.author} (${poem.dynasty})`);
        console.log(`     标签: ${poem.tags ? poem.tags.join(', ') : '无'}`);
      });
      console.log('');
    } else {
      console.log('❌ 未找到诗词数据\n');
      return;
    }
    
    // 3. 检查朝代分布
    console.log('3. 检查朝代分布...');
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
    
    // 4. 检查作者分布
    console.log('4. 检查作者分布...');
    const { data: authorData, error: authorError } = await supabase
      .from('poems')
      .select('author');
    
    if (authorError) {
      console.error('❌ 检查作者分布失败:', authorError);
      return;
    }
    
    const authorCount = {};
    authorData.forEach(item => {
      authorCount[item.author] = (authorCount[item.author] || 0) + 1;
    });
    
    console.log('✅ 作者数量:', Object.keys(authorCount).length);
    console.log('   前10位作者:');
    Object.entries(authorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([author, count]) => {
        console.log(`   ${author}: ${count} 首`);
      });
    console.log('');
    
    // 5. 检查标签系统
    console.log('5. 检查标签系统...');
    const { data: tagData, error: tagError } = await supabase
      .from('poems')
      .select('tags');
    
    if (tagError) {
      console.error('❌ 检查标签系统失败:', tagError);
      return;
    }
    
    const allTags = new Set();
    tagData.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => allTags.add(tag));
      }
    });
    
    console.log(`✅ 标签总数: ${allTags.size}`);
    console.log('   部分标签:', Array.from(allTags).slice(0, 20).join(', '));
    console.log('');
    
    // 6. 测试诗词服务功能
    console.log('6. 测试诗词服务功能...');
    const { data: testPoems, error: testError } = await supabase
      .from('poems')
      .select('*')
      .eq('dynasty', '唐')
      .limit(3);
    
    if (testError) {
      console.error('❌ 测试查询失败:', testError);
    } else {
      console.log('✅ 唐代诗词查询成功:');
      testPoems.forEach(poem => {
        console.log(`   - ${poem.title} (${poem.author})`);
      });
    }
    
    console.log('\n🎉 验证完成！');
    
  } catch (error) {
    console.error('验证过程中发生错误:', error);
  }
}

verifyImport();