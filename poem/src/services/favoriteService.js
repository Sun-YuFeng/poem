import { supabase } from '../utils/supabase.js'

class FavoriteService {
  // 获取用户收藏的诗词列表
  async getUserFavorites(userId) {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('poem_id')
        .eq('user_id', userId)

      if (error) throw error
      
      return {
        success: true,
        favorites: data.map(item => item.poem_id)
      }
    } catch (error) {
      console.error('获取用户收藏失败:', error)
      return {
        success: false,
        message: '获取收藏列表失败',
        favorites: []
      }
    }
  }

  // 添加收藏
  async addFavorite(userId, poemId) {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .insert([
          { user_id: userId, poem_id: poemId }
        ])
        .select()

      if (error) throw error
      
      return {
        success: true,
        message: '收藏成功'
      }
    } catch (error) {
      console.error('添加收藏失败:', error)
      return {
        success: false,
        message: '收藏失败'
      }
    }
  }

  // 取消收藏
  async removeFavorite(userId, poemId) {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('poem_id', poemId)

      if (error) throw error
      
      return {
        success: true,
        message: '取消收藏成功'
      }
    } catch (error) {
      console.error('取消收藏失败:', error)
      return {
        success: false,
        message: '取消收藏失败'
      }
    }
  }

  // 检查诗词是否被收藏
  async isFavorite(userId, poemId) {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('poem_id', poemId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      return {
        success: true,
        isFavorite: !!data
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error)
      return {
        success: false,
        message: '检查收藏状态失败',
        isFavorite: false
      }
    }
  }

  // 获取用户收藏的诗词详情
  async getFavoritePoems(userId) {
    try {
      console.log('查询收藏诗词，用户ID:', userId)
      
      // 先查询收藏关系
      const { data: favorites, error: favError } = await supabase
        .from('user_favorites')
        .select('poem_id')
        .eq('user_id', userId)

      if (favError) throw favError
      
      console.log('收藏关系数据:', favorites)
      
      if (!favorites || favorites.length === 0) {
        return {
          success: true,
          poems: []
        }
      }

      // 获取诗词ID列表
      const poemIds = favorites.map(fav => fav.poem_id)
      console.log('诗词ID列表:', poemIds)

      // 查询诗词详情
      const { data: poems, error: poemError } = await supabase
        .from('poems')
        .select('*')
        .in('id', poemIds)

      if (poemError) throw poemError
      
      console.log('查询到的诗词:', poems)
      
      return {
        success: true,
        poems: poems || []
      }
    } catch (error) {
      console.error('获取收藏诗词详情失败:', error)
      return {
        success: false,
        message: '获取收藏诗词失败',
        poems: []
      }
    }
  }
}

export default new FavoriteService()