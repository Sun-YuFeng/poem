import { supabase } from '../utils/supabase.js'

// 获取所有诗词
export const getAllPoems = async () => {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .order('dynasty')
    .order('author')
  
  if (error) {
    console.error('获取诗词列表失败:', error)
    return []
  }
  return data || []
}

// 根据标签筛选诗词
export const getPoemsByTag = async (tag) => {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .contains('tags', [tag])
    .order('dynasty')
    .order('author')
  
  if (error) {
    console.error('根据标签筛选诗词失败:', error)
    return []
  }
  return data || []
}

// 根据朝代筛选诗词
export const getPoemsByDynasty = async (dynasty) => {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .eq('dynasty', dynasty)
    .order('author')
  
  if (error) {
    console.error('根据朝代筛选诗词失败:', error)
    return []
  }
  return data || []
}

// 根据作者筛选诗词
export const getPoemsByAuthor = async (author) => {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .eq('author', author)
    .order('title')
  
  if (error) {
    console.error('根据作者筛选诗词失败:', error)
    return []
  }
  return data || []
}

// 搜索诗词（标题、作者、内容）
export const searchPoems = async (keyword) => {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .or(`title.ilike.%${keyword}%,author.ilike.%${keyword}%,content.ilike.%${keyword}%`)
    .order('dynasty')
    .order('author')
  
  if (error) {
    console.error('搜索诗词失败:', error)
    return []
  }
  return data || []
}

// 获取所有标签
export const getAllTags = async () => {
  const { data, error } = await supabase
    .from('poems')
    .select('tags')
  
  if (error) {
    console.error('获取标签列表失败:', error)
    return []
  }
  
  // 提取所有标签并去重
  const allTags = data.flatMap(poem => poem.tags || [])
  return [...new Set(allTags)].sort()
}

// 获取所有朝代
export const getAllDynasties = async () => {
  const { data, error } = await supabase
    .from('poems')
    .select('dynasty')
  
  if (error) {
    console.error('获取朝代列表失败:', error)
    return []
  }
  
  // 提取所有朝代并去重
  const dynasties = data.map(poem => poem.dynasty)
  const uniqueDynasties = [...new Set(dynasties)]
  
  // 添加新的朝代选项
  const additionalDynasties = ['先秦', '两汉', '魏晋', '隋', '金', '元', '明', '清']
  
  // 合并并去重，然后排序
  const allDynasties = [...new Set([...uniqueDynasties, ...additionalDynasties])].sort()
  
  return allDynasties
}

// 获取所有作者
export const getAllAuthors = async () => {
  const { data, error } = await supabase
    .from('poems')
    .select('author')
  
  if (error) {
    console.error('获取作者列表失败:', error)
    return []
  }
  
  // 提取所有作者并去重
  const authors = data.map(poem => poem.author)
  return [...new Set(authors)].sort()
}

// 添加新诗词
export const addPoem = async (poemData) => {
  const { data, error } = await supabase
    .from('poems')
    .insert([poemData])
    .select()
  
  if (error) {
    console.error('添加诗词失败:', error)
    throw error
  }
  return data[0]
}

// 更新诗词
export const updatePoem = async (id, poemData) => {
  const { data, error } = await supabase
    .from('poems')
    .update(poemData)
    .eq('id', id)
    .select()
  
  if (error) {
    console.error('更新诗词失败:', error)
    throw error
  }
  return data[0]
}

// 删除诗词
export const deletePoem = async (id) => {
  const { error } = await supabase
    .from('poems')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('删除诗词失败:', error)
    throw error
  }
  return true
}