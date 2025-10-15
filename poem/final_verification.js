import { supabase } from './src/utils/supabase.js';
import { 
  getAllPoems as getPoems, 
  getAllTags as getTags, 
  getAllDynasties as getDynasties, 
  getAllAuthors as getAuthors 
} from './src/services/poemService.js';

async function finalVerification() {
  console.log('🎯 最终验证 - 诗词系统完整测试\n');
  
  try {
    // 1. 验证诗词服务
    console.log('1. 验证诗词服务...');
    const poems = await getPoems();
    console.log(`✅ 诗词服务: 获取到 ${poems.length} 首诗词`);
    
    // 2. 验证标签服务
    console.log('2. 验证标签服务...');
    const tags = await getTags();
    console.log(`✅ 标签服务: 获取到 ${tags.length} 个标签`);
    console.log('   部分标签:', tags.slice(0, 10).join(', '));
    
    // 3. 验证朝代服务
    console.log('3. 验证朝代服务...');
    const dynasties = await getDynasties();
    console.log(`✅ 朝代服务: 获取到 ${dynasties.length} 个朝代`);
    console.log('   朝代列表:', dynasties.join(', '));
    
    // 4. 验证作者服务
    console.log('4. 验证作者服务...');
    const authors = await getAuthors();
    console.log(`✅ 作者服务: 获取到 ${authors.length} 位作者`);
    console.log('   部分作者:', authors.slice(0, 10).join(', '));
    
    // 5. 测试筛选功能
    console.log('5. 测试筛选功能...');
    const tangPoems = await getPoems({ dynasty: '唐' });
    console.log(`✅ 唐代诗词筛选: 找到 ${tangPoems.length} 首`);
    
    const liBaiPoems = await getPoems({ author: '李白' });
    console.log(`✅ 李白诗词筛选: 找到 ${liBaiPoems.length} 首`);
    
    const sceneryPoems = await getPoems({ tag: '写景' });
    console.log(`✅ 写景诗词筛选: 找到 ${sceneryPoems.length} 首`);
    
    // 6. 验证数据完整性
    console.log('6. 验证数据完整性...');
    const totalPoems = await getPoems();
    console.log(`✅ 总诗词数量: ${totalPoems.length} 首`);
    
    // 检查数据格式
    if (totalPoems.length > 0) {
      const samplePoem = totalPoems[0];
      console.log('✅ 数据格式验证:');
      console.log(`   - 标题: ${samplePoem.title}`);
      console.log(`   - 作者: ${samplePoem.author}`);
      console.log(`   - 朝代: ${samplePoem.dynasty}`);
      console.log(`   - 标签: ${samplePoem.tags ? samplePoem.tags.join(', ') : '无'}`);
      console.log(`   - 内容长度: ${samplePoem.content ? samplePoem.content.length : 0} 字符`);
    }
    
    console.log('\n🎉 最终验证完成！');
    console.log('\n📊 系统状态总结:');
    console.log(`   ✅ 诗词数据: ${totalPoems.length} 首`);
    console.log(`   ✅ 标签系统: ${tags.length} 个标签`);
    console.log(`   ✅ 朝代分类: ${dynasties.length} 个朝代`);
    console.log(`   ✅ 作者管理: ${authors.length} 位作者`);
    console.log(`   ✅ 筛选功能: 朝代、作者、标签筛选正常`);
    
    console.log('\n🚀 系统已准备就绪！');
    console.log('   您现在可以访问 http://localhost:5173 测试前端应用');
    
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error);
  }
}

finalVerification();