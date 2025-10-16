import { supabase } from './src/utils/supabase.js';

async function testDynasties() {
  console.log('测试新朝代数据功能...\n');
  
  try {
    // 测试Supabase连接
    console.log('1. 测试Supabase连接...');
    const { data, error } = await supabase
      .from('poems')
      .select('dynasty')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase连接失败:', error);
      return;
    }
    
    console.log('✅ Supabase连接成功\n');
    
    // 检查当前数据库中的朝代
    console.log('2. 检查当前朝代数据...');
    const { data: dynasties, error: dynastiesError } = await supabase
      .from('poems')
      .select('dynasty');
    
    if (dynastiesError) {
      console.error('❌ 获取朝代数据失败:', dynastiesError);
      return;
    }
    
    const uniqueDynasties = [...new Set(dynasties.map(d => d.dynasty))].sort();
    console.log('✅ 当前数据库中的朝代:', uniqueDynasties.join(', '));
    console.log('   朝代数量:', uniqueDynasties.length);
    
    // 检查是否包含新朝代
    const newDynasties = ['先秦', '两汉', '魏晋', '隋', '金', '元', '明', '清'];
    const missingDynasties = newDynasties.filter(d => !uniqueDynasties.includes(d));
    
    if (missingDynasties.length > 0) {
      console.log('\n❌ 缺少的新朝代:', missingDynasties.join(', '));
      console.log('   需要添加这些朝代的诗词数据');
    } else {
      console.log('\n✅ 所有新朝代都已存在！');
    }
    
    // 测试添加一条新朝代诗词
    console.log('\n3. 测试添加新朝代诗词...');
    const testPoem = {
      title: '关雎',
      author: '佚名',
      dynasty: '先秦',
      content: '关关雎鸠，在河之洲。窈窕淑女，君子好逑。',
      tags: ['爱情', '诗经', '抒情'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: insertedData, error: insertError } = await supabase
      .from('poems')
      .insert([testPoem])
      .select();
    
    if (insertError) {
      console.error('❌ 插入测试数据失败:', insertError);
      console.log('   可能需要先创建poems表或检查表结构');
    } else {
      console.log('✅ 测试数据插入成功！');
      console.log('   插入的诗词:', insertedData[0].title, '-', insertedData[0].author);
      
      // 删除测试数据
      const { error: deleteError } = await supabase
        .from('poems')
        .delete()
        .eq('id', insertedData[0].id);
      
      if (deleteError) {
        console.error('❌ 删除测试数据失败:', deleteError);
      } else {
        console.log('✅ 测试数据已清理');
      }
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

testDynasties();