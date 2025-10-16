import { supabase } from './src/utils/supabase.js';

// 新朝代诗词数据
const newDynastiesPoems = [
  {
    title: '关雎',
    author: '佚名',
    dynasty: '先秦',
    content: '关关雎鸠，在河之洲。窈窕淑女，君子好逑。参差荇菜，左右流之。窈窕淑女，寤寐求之。',
    tags: ['爱情', '诗经', '抒情']
  },
  {
    title: '蒹葭',
    author: '佚名',
    dynasty: '先秦',
    content: '蒹葭苍苍，白露为霜。所谓伊人，在水一方。溯洄从之，道阻且长。溯游从之，宛在水中央。',
    tags: ['爱情', '诗经', '抒情']
  },
  {
    title: '大风歌',
    author: '刘邦',
    dynasty: '两汉',
    content: '大风起兮云飞扬，威加海内兮归故乡，安得猛士兮守四方！',
    tags: ['豪放', '抒情', '帝王']
  },
  {
    title: '垓下歌',
    author: '项羽',
    dynasty: '两汉',
    content: '力拔山兮气盖世，时不利兮骓不逝。骓不逝兮可奈何，虞兮虞兮奈若何！',
    tags: ['悲壮', '抒情', '英雄']
  },
  {
    title: '短歌行',
    author: '曹操',
    dynasty: '魏晋',
    content: '对酒当歌，人生几何！譬如朝露，去日苦多。慨当以慷，忧思难忘。何以解忧？唯有杜康。',
    tags: ['抒情', '哲理', '人生']
  },
  {
    title: '七步诗',
    author: '曹植',
    dynasty: '魏晋',
    content: '煮豆燃豆萁，豆在釜中泣。本是同根生，相煎何太急？',
    tags: ['哲理', '抒情', '兄弟']
  },
  {
    title: '饮酒',
    author: '陶渊明',
    dynasty: '魏晋',
    content: '结庐在人境，而无车马喧。问君何能尔？心远地自偏。采菊东篱下，悠然见南山。',
    tags: ['田园', '哲理', '抒情']
  },
  {
    title: '春江花月夜',
    author: '杨广',
    dynasty: '隋',
    content: '暮江平不动，春花满正开。流波将月去，潮水带星来。',
    tags: ['写景', '春天', '月亮']
  },
  {
    title: '江上渔者',
    author: '完颜璟',
    dynasty: '金',
    content: '江上往来人，但爱鲈鱼美。君看一叶舟，出没风波里。',
    tags: ['哲理', '社会', '写景']
  },
  {
    title: '天净沙·秋思',
    author: '马致远',
    dynasty: '元',
    content: '枯藤老树昏鸦，小桥流水人家，古道西风瘦马。夕阳西下，断肠人在天涯。',
    tags: ['秋天', '抒情', '思乡']
  },
  {
    title: '石灰吟',
    author: '于谦',
    dynasty: '明',
    content: '千锤万凿出深山，烈火焚烧若等闲。粉骨碎身浑不怕，要留清白在人间。',
    tags: ['咏物', '哲理', '励志']
  },
  {
    title: '己亥杂诗',
    author: '龚自珍',
    dynasty: '清',
    content: '九州生气恃风雷，万马齐喑究可哀。我劝天公重抖擞，不拘一格降人才。',
    tags: ['哲理', '社会', '励志']
  }
];

async function addNewDynasties() {
  console.log('开始添加新朝代诗词数据...\n');
  
  try {
    // 检查诗词表是否存在
    console.log('1. 检查诗词表...');
    const { data: existingPoems, error: checkError } = await supabase
      .from('poems')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('❌ poems表不存在，需要先创建表结构');
      return;
    }
    
    console.log('✅ poems表存在\n');
    
    // 检查是否已存在这些诗词
    console.log('2. 检查重复诗词...');
    const titles = newDynastiesPoems.map(p => p.title);
    const { data: existingTitles } = await supabase
      .from('poems')
      .select('title')
      .in('title', titles);
    
    const existingTitleSet = new Set(existingTitles?.map(p => p.title) || []);
    const poemsToAdd = newDynastiesPoems.filter(p => !existingTitleSet.has(p.title));
    
    if (poemsToAdd.length === 0) {
      console.log('✅ 所有新朝代诗词已存在\n');
      return;
    }
    
    console.log(`✅ 将添加 ${poemsToAdd.length} 首新诗词\n`);
    
    // 准备插入数据
    const poemsWithTimestamps = poemsToAdd.map(poem => ({
      ...poem,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // 插入数据
    console.log('3. 插入新朝代诗词...');
    const { data: insertedData, error: insertError } = await supabase
      .from('poems')
      .insert(poemsWithTimestamps)
      .select();
    
    if (insertError) {
      console.error('❌ 插入失败:', insertError);
      return;
    }
    
    console.log(`✅ 成功插入 ${insertedData.length} 首诗词\n`);
    
    // 验证新朝代
    console.log('4. 验证新朝代数据...');
    const newDynasties = [...new Set(poemsToAdd.map(p => p.dynasty))];
    
    for (const dynasty of newDynasties) {
      const { data: dynastyData } = await supabase
        .from('poems')
        .select('*', { count: 'exact' })
        .eq('dynasty', dynasty);
      
      console.log(`   ${dynasty}: ${dynastyData.length} 首诗词`);
    }
    
    console.log('\n🎉 新朝代诗词添加完成！');
    console.log('现在朝代筛选器中将包含以下新选项:');
    console.log('✅ 先秦, 两汉, 魏晋, 隋, 金, 元, 明, 清');
    
  } catch (error) {
    console.error('添加新朝代数据过程中发生错误:', error);
  }
}

// 运行函数
addNewDynasties();