# Supabase 诗词数据导入指南

## 📋 导入步骤

### 1. 登录Supabase控制台
- 访问 https://supabase.com/dashboard
- 选择项目：`iieiexavhizsjywudmpw`

### 2. 导入CSV数据
1. 进入 **Table Editor**
2. 选择 `poems` 表
3. 点击 **Import data via CSV** 按钮
4. 上传 `poems_data.csv` 文件
5. 确认导入设置：
   - 分隔符：逗号 (,)
   - 文本限定符：双引号 (")
   - 编码：UTF-8

### 3. 验证导入结果
导入完成后，执行以下SQL验证数据：

```sql
-- 检查总记录数
SELECT COUNT(*) as total_poems FROM poems;

-- 检查朝代分布
SELECT dynasty, COUNT(*) FROM poems GROUP BY dynasty;

-- 检查作者分布
SELECT author, COUNT(*) FROM poems GROUP BY author;

-- 检查标签分布
SELECT unnest(tags) as tag, COUNT(*) 
FROM poems 
GROUP BY tag 
ORDER BY COUNT(*) DESC;
```

## 📊 数据统计
- **诗词总数**: 70首
- **朝代分布**: 唐、宋、汉、北朝等
- **作者数量**: 30+位著名诗人
- **标签数量**: 40+个分类标签

## ✅ 导入后验证
导入成功后，您应该看到：
- 诗词总数：70
- 朝代分布：唐、宋、汉、北朝等
- 标签系统正常工作

## 🚀 启动应用测试
数据导入完成后，启动应用测试：

```bash
cd poem
npm run dev
```

访问 http://localhost:5173 测试功能：
- ✅ 搜索诗词（标题、作者、内容、标签）
- ✅ 按标签筛选
- ✅ 按朝代筛选
- ✅ 按作者筛选
- ✅ 诗词详情查看

## 📁 文件说明
- `poems_data.csv` - 完整的诗词数据CSV文件
- 包含70首经典诗词，每首都有完整的标签分类

**请完成CSV导入后告诉我，我将帮您测试整个系统！**