import { supabase } from './supabase.js';

async function checkPoemsTable() {
  console.log('检查诗词表状态...');
  
  try {
    // 检查诗词表是否存在
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('检查诗词表时出错:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log(`诗词表存在，包含 ${data.length} 条记录`);
      console.log('第一条记录:', data[0]);
    } else {
      console.log('诗词表为空或不存在');
    }
    
    // 检查表结构
    const { data: structure, error: structureError } = await supabase
      .from('poems')
      .select('*')
      .limit(0);
    
    if (structureError) {
      console.error('检查表结构时出错:', structureError);
    } else {
      console.log('诗词表结构正常');
    }
    
  } catch (error) {
    console.error('检查过程中发生错误:', error);
  }
}

checkPoemsTable();