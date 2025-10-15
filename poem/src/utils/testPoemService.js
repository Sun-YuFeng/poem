import { getAllPoems, getAllTags, getAllDynasties, getAllAuthors } from '../services/poemService.js'

// 测试诗词服务
const testPoemService = async () => {
  console.log('开始测试诗词服务...')
  
  try {
    // 测试获取所有诗词
    console.log('1. 测试获取所有诗词...')
    const poems = await getAllPoems()
    console.log(`获取到 ${poems.length} 首诗词`)
    
    // 测试获取所有标签
    console.log('2. 测试获取所有标签...')
    const tags = await getAllTags()
    console.log(`获取到 ${tags.length} 个标签:`, tags.slice(0, 10))
    
    // 测试获取所有朝代
    console.log('3. 测试获取所有朝代...')
    const dynasties = await getAllDynasties()
    console.log(`获取到 ${dynasties.length} 个朝代:`, dynasties)
    
    // 测试获取所有作者
    console.log('4. 测试获取所有作者...')
    const authors = await getAllAuthors()
    console.log(`获取到 ${authors.length} 位作者:`, authors.slice(0, 10))
    
    console.log('诗词服务测试完成！')
    
  } catch (error) {
    console.error('诗词服务测试失败:', error)
  }
}

// 运行测试
testPoemService()