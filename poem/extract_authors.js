import fs from 'fs';
import { parse } from 'csv-parse/sync';

// 读取两个CSV文件
const poemsDataCsv = fs.readFileSync('./poems_data.csv', 'utf8');
const newDynastiesCsv = fs.readFileSync('./new_dynasties_complete.csv', 'utf8');

// 解析CSV数据
const poemsData = parse(poemsDataCsv, {
  columns: true,
  skip_empty_lines: true
});

const newDynastiesData = parse(newDynastiesCsv, {
  columns: true,
  skip_empty_lines: true
});

// 提取所有诗人
const allAuthors = new Set();

// 从原始数据中提取诗人
poemsData.forEach(poem => {
  if (poem.author && poem.author.trim()) {
    allAuthors.add(poem.author.trim());
  }
});

// 从新朝代数据中提取诗人
newDynastiesData.forEach(poem => {
  if (poem.author && poem.author.trim()) {
    allAuthors.add(poem.author.trim());
  }
});

// 转换为数组并排序
const authorsArray = Array.from(allAuthors).sort();

console.log('📊 所有诗人统计:');
console.log(`总诗人数量: ${authorsArray.length}`);
console.log('诗人列表:');
authorsArray.forEach((author, index) => {
  console.log(`${index + 1}. ${author}`);
});

// 检查当前HomeView.vue中的诗人数据
console.log('\n📋 当前HomeView.vue中的诗人:');
const currentPoets = [
  '李白', '杜甫', '王维', '白居易', '苏轼', '辛弃疾', '李清照', 
  '陶渊明', '王安石', '孟浩然', '柳宗元', '韩愈'
];
console.log(`当前诗人数量: ${currentPoets.length}`);
currentPoets.forEach((poet, index) => {
  console.log(`${index + 1}. ${poet}`);
});

// 找出需要添加的诗人
const missingAuthors = authorsArray.filter(author => !currentPoets.includes(author));

console.log('\n➕ 需要添加到筛选器的诗人:');
console.log(`需要添加的诗人数量: ${missingAuthors.length}`);
if (missingAuthors.length > 0) {
  missingAuthors.forEach((author, index) => {
    console.log(`${index + 1}. ${author}`);
  });
} else {
  console.log('所有诗人已存在，无需添加');
}

// 生成新的诗人数组（包含所有诗人）
const newPoetsArray = [...currentPoets, ...missingAuthors].sort();

console.log('\n🎯 完整的诗人筛选器列表:');
console.log(`总诗人数量: ${newPoetsArray.length}`);
newPoetsArray.forEach((poet, index) => {
  console.log(`${index + 1}. ${poet}`);
});

// 保存到文件供参考
fs.writeFileSync('./all_authors.txt', newPoetsArray.join('\n'));
console.log('\n💾 完整诗人列表已保存到 all_authors.txt');