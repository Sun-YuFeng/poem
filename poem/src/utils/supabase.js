import { createClient } from '@supabase/supabase-js'

// Supabase配置 - 更新为新的项目配置
const supabaseUrl = 'https://csdvjvjlthkjyhlxhbtl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZHZqdmpsdGhranlobHhoYnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDMwMDcsImV4cCI6MjA3ODY3OTAwN30.ooqro9GX3_US_xrAluOjI7Sj2eDPEGSBPBJSKdVSeAQ'

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)