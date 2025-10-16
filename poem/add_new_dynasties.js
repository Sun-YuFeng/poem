import { supabase } from './src/utils/supabase.js';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

async function addNewDynasties() {
  console.log('开始添加新朝代诗词数据...\n');
  
  try {
    // 读取新的朝代诗词数据
    console.log('1. 读取新朝代诗词数据...');
    const csvData = fs.readFileSync('./new_dynasties_poems.csv', 'utf8');
    const newPoems = parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`✅ 读取到 ${newPoems.length} 首新朝代诗词\n`);
    
    // 检查数据库中是否已存在这些诗词
    console.log('2. 检查重复诗词...');
    const existingTitles = new Set();
    
    // 分批检查避免超时
    for (let i = 0; i < newPoems.length; i += 10) {
      const batch = newPoems.slice(i, i + 10);
      const titles = batch.map(p => p.title);
      
      const { data: existingData } = await supabase
        .from('poems')
        .select('title')
        .in('title', titles);
      
      if (existingData) {
        existingData.forEach(poem => existingTitles.add(poem.title));
      }
    }
    
    const uniqueNewPoems = newPoems.filter(poem => !existingTitles.has(poem.title));
    
    if (uniqueNewPoems.length === 0) {
      console.log('✅ 所有新朝代诗词已存在，无需添加\n');
      return;
    }
    
    console.log(`✅ 将添加 ${uniqueNewPoems.length} 首新诗词\n`);
    
    // 准备插入数据
    const poemsToInsert = uniqueNewPoems.map(poem => ({
      title: poem.title,
      author: poem.author,
      dynasty: poem.dynasty,
      content: poem.content,
      tags: JSON.parse(poem.tags.replace(/'/g, '"')),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // 分批插入数据
    console.log('3. 插入新朝代诗词数据...');
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < poemsToInsert.length; i += 10) {
      const batch = poemsToInsert.slice(i, i + 10);
      
      const { data, error } = await supabase
        .from('poems')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`❌ 批次 ${Math.floor(i/10) + 1} 插入失败:`, error);
        errorCount += batch.length;
      } else {
        console.log(`✅ 批次 ${Math.floor(i/10) + 1} 插入成功: ${data.length} 首诗词`);
        successCount += data.length;
      }
    }
    
    console.log(`\n📊 插入结果:`);
    console.log(`✅ 成功插入: ${successCount} 首`);
    console.log(`❌ 插入失败: ${errorCount} 首`);
    
    // 验证新朝代数据
    console.log('\n4. 验证新朝代数据...');
    
    // 检查新添加的朝代
    const newDynasties = [...new Set(uniqueNewPoems.map(p => p.dynasty))];
    console.log('✅ 新添加的朝代:', newDynasties.join(', '));
    
    // 检查每个新朝代的诗词数量
    for (const dynasty of newDynasties) {
      const { data: dynastyData } = await supabase
        .from('poems')
        .select('*', { count: 'exact' })
        .eq('dynasty', dynasty);
      
      console.log(`   ${dynasty}: ${dynastyData.length} 首诗词`);
    }
    
    console.log('\n🎉 新朝代诗词数据添加完成！');
    console.log('\n现在朝代筛选器中将包含以下新选项:');
    console.log('✅ 先秦, 两汉, 魏晋, 隋, 金, 元, 明, 清');
    
  } catch (error) {
    console.error('添加新朝代数据过程中发生错误:', error);
  }
}

// 运行脚本
addNewDynasties();