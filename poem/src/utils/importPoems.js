import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://csdvjvjlthkjyhlxhbtl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZHZqdmpsdGhranlobHhoYnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDMwMDcsImV4cCI6MjA3ODY3OTAwN30.ooqro9GX3_US_xrAluOjI7Sj2eDPEGSBPBJSKdVSeAQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 读取CSV文件数据
const poemsData = [
  {
    title: "关雎",
    author: "佚名",
    dynasty: "先秦",
    content: "关关雎鸠，在河之洲。窈窕淑女，君子好逑。参差荇菜，左右流之。窈窕淑女，寤寐求之。",
    tags: ["爱情", "诗经", "抒情"]
  },
  {
    title: "蒹葭",
    author: "佚名",
    dynasty: "先秦",
    content: "蒹葭苍苍，白露为霜。所谓伊人，在水一方。溯洄从之，道阻且长。溯游从之，宛在水中央。",
    tags: ["爱情", "诗经", "抒情"]
  },
  {
    title: "离骚",
    author: "屈原",
    dynasty: "先秦",
    content: "帝高阳之苗裔兮，朕皇考曰伯庸。摄提贞于孟陬兮，惟庚寅吾以降。皇览揆余初度兮，肇锡余以嘉名。",
    tags: ["抒情", "哲理", "楚辞"]
  },
  {
    title: "大风歌",
    author: "刘邦",
    dynasty: "两汉",
    content: "大风起兮云飞扬，威加海内兮归故乡，安得猛士兮守四方！",
    tags: ["豪放", "抒情", "帝王"]
  },
  {
    title: "垓下歌",
    author: "项羽",
    dynasty: "两汉",
    content: "力拔山兮气盖世，时不利兮骓不逝。骓不逝兮可奈何，虞兮虞兮奈若何！",
    tags: ["悲壮", "抒情", "英雄"]
  },
  {
    title: "短歌行",
    author: "曹操",
    dynasty: "魏晋",
    content: "对酒当歌，人生几何！譬如朝露，去日苦多。慨当以慷，忧思难忘。何以解忧？唯有杜康。",
    tags: ["抒情", "哲理", "人生"]
  },
  {
    title: "七步诗",
    author: "曹植",
    dynasty: "魏晋",
    content: "煮豆燃豆萁，豆在釜中泣。本是同根生，相煎何太急？",
    tags: ["哲理", "抒情", "兄弟"]
  },
  {
    title: "饮酒",
    author: "陶渊明",
    dynasty: "魏晋",
    content: "结庐在人境，而无车马喧。问君何能尔？心远地自偏。采菊东篱下，悠然见南山。",
    tags: ["田园", "哲理", "抒情"]
  },
  {
    title: "归园田居",
    author: "陶渊明",
    dynasty: "魏晋",
    content: "少无适俗韵，性本爱丘山。误落尘网中，一去三十年。羁鸟恋旧林，池鱼思故渊。",
    tags: ["田园", "抒情", "哲理"]
  },
  {
    title: "春江花月夜",
    author: "杨广",
    dynasty: "隋",
    content: "暮江平不动，春花满正开。流波将月去，潮水带星来。",
    tags: ["写景", "春天", "月亮"]
  }
]

// 导入诗词数据
async function importPoems() {
  try {
    console.log('开始导入诗词数据...')
    
    // 先清空现有数据（可选）
    // const { error: deleteError } = await supabase.from('poems').delete().neq('id', '')
    // if (deleteError) {
    //   console.log('清空现有数据失败，继续导入...')
    // }
    
    // 批量插入诗词数据
    const { data, error } = await supabase
      .from('poems')
      .insert(poemsData)
      .select()
    
    if (error) {
      console.error('导入诗词数据失败:', error)
      return
    }
    
    console.log(`成功导入 ${data.length} 首诗词`)
    console.log('诗词数据导入完成！')
    
  } catch (error) {
    console.error('导入过程中发生错误:', error)
  }
}

// 运行导入函数
importPoems()