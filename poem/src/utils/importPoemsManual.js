import { supabase } from './supabase.js'

/**
 * 手动导入诗词数据到Supabase数据库
 * 这个工具可以逐条导入数据，避免JSON格式问题
 */

export class PoemImporter {
  constructor() {
    this.batchSize = 5 // 每次导入5条，避免请求过多
  }

  /**
   * 解析CSV数据行
   */
  parseCSVRow(row) {
    try {
      const [title, author, dynasty, content, tags] = row.split(',').map(field => 
        field.trim().replace(/^"/, '').replace(/"$/, '')
      )
      
      // 处理tags数组格式
      let parsedTags = []
      if (tags && tags.startsWith('{"')) {
        parsedTags = tags.replace(/^{/, '').replace(/}$/, '').split(',')
          .map(tag => tag.replace(/"/g, '').trim())
          .filter(tag => tag.length > 0)
      }
      
      return {
        title: title || '未知标题',
        author: author || '佚名',
        dynasty: dynasty || '未知朝代',
        content: content || '无内容',
        tags: parsedTags.length > 0 ? parsedTags : ['古典诗词']
      }
    } catch (error) {
      console.error('解析CSV行失败:', error)
      return null
    }
  }

  /**
   * 检查诗词是否已存在
   */
  async checkPoemExists(title, author) {
    const { data, error } = await supabase
      .from('poems')
      .select('id')
      .eq('title', title)
      .eq('author', author)
      .limit(1)

    if (error) {
      console.error('检查诗词存在性失败:', error)
      return false
    }

    return data && data.length > 0
  }

  /**
   * 导入单条诗词数据
   */
  async importSinglePoem(poemData) {
    try {
      // 检查是否已存在
      const exists = await this.checkPoemExists(poemData.title, poemData.author)
      if (exists) {
        console.log(`诗词已存在: ${poemData.title} - ${poemData.author}`)
        return { success: true, skipped: true }
      }

      // 导入数据
      const { data, error } = await supabase
        .from('poems')
        .insert([{
          title: poemData.title,
          author: poemData.author,
          dynasty: poemData.dynasty,
          content: poemData.content,
          tags: poemData.tags
        }])
        .select()

      if (error) {
        console.error(`导入诗词失败: ${poemData.title}`, error)
        return { success: false, error }
      }

      console.log(`导入成功: ${poemData.title} - ${poemData.author}`)
      return { success: true, data }
    } catch (error) {
      console.error(`导入诗词异常: ${poemData.title}`, error)
      return { success: false, error }
    }
  }

  /**
   * 批量导入诗词数据
   */
  async importBatchPoems(csvData) {
    const rows = csvData.split('\n').filter(row => row.trim().length > 0)
    
    // 跳过标题行
    const dataRows = rows.slice(1)
    
    console.log(`开始导入 ${dataRows.length} 条诗词数据...`)
    
    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    // 分批处理
    for (let i = 0; i < dataRows.length; i += this.batchSize) {
      const batch = dataRows.slice(i, i + this.batchSize)
      
      console.log(`处理批次 ${Math.floor(i/this.batchSize) + 1}/${Math.ceil(dataRows.length/this.batchSize)}`)
      
      for (const row of batch) {
        const poemData = this.parseCSVRow(row)
        if (!poemData) {
          errorCount++
          continue
        }

        const result = await this.importSinglePoem(poemData)
        if (result.success) {
          if (result.skipped) {
            skipCount++
          } else {
            successCount++
          }
        } else {
          errorCount++
        }

        // 添加延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`导入完成! 成功: ${successCount}, 跳过: ${skipCount}, 失败: ${errorCount}`)
    return { successCount, skipCount, errorCount }
  }

  /**
   * 主导入函数
   */
  async importPoemsFromCSV(csvFilePath) {
    try {
      // 这里需要Node.js环境来读取文件
      // 在实际使用中，您可能需要使用其他方式获取CSV数据
      console.log('请将CSV数据作为字符串传入importBatchPoems方法')
      console.log('或者使用Node.js的fs模块读取文件')
      
    } catch (error) {
      console.error('导入诗词数据失败:', error)
      throw error
    }
  }
}

// 使用示例
/**
 * 使用方法:
 * 1. 将CSV文件内容作为字符串传入
 * 2. 调用importBatchPoems方法
 * 
 * 示例代码:
 * const importer = new PoemImporter()
 * const csvData = `title,author,dynasty,content,tags
 * 关雎,佚名,先秦,"关关雎鸠...","{\"爱情\",\"诗经\"}"
 * ...`
 * 
 * importer.importBatchPoems(csvData)
 *   .then(result => console.log('导入结果:', result))
 *   .catch(error => console.error('导入失败:', error))
 */

export default PoemImporter