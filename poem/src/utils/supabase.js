import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://iieiexavhizsjywudmpw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZWlleGF2aGl6c2p5d3VkbXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDk0NjQsImV4cCI6MjA3NjA4NTQ2NH0.9rsatEUfQB7GknxGpD0W21md-KiI-EKpYOaI_OE69-Y'

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)