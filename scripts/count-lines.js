#!/usr/bin/env node

/**
 * 递归统计指定目录下所有代码文件的行数
 * 
 * 使用方法:
 *   node scripts/count-lines.js [目录路径]
 *   node scripts/count-lines.js src
 *   node scripts/count-lines.js .
 * 
 * 如果不指定目录，默认统计 src 目录
 */

const fs = require('fs');
const path = require('path');

// 需要排除的目录
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.vscode',
  '.idea',
  'coverage',
  '.next',
  '.nuxt',
  '.cache',
  'out',
  'public',
  'static',
  '__pycache__'
];

// 支持的代码文件扩展名
const CODE_EXTENSIONS = [
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.vue',
  '.html',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.json',
  '.md',
  '.py',
  '.java',
  '.c',
  '.cpp',
  '.h',
  '.hpp',
  '.go',
  '.rs',
  '.php',
  '.rb',
  '.swift',
  '.kt',
  '.sh',
  '.sql',
  '.yaml',
  '.yml',
  '.xml',
  '.toml',
  '.ini',
  '.conf'
];

/**
 * 统计单个文件的行数
 */
function countFileLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').length;
    return lines;
  } catch (err) {
    console.error(`读取文件失败: ${filePath}`, err.message);
    return 0;
  }
}

/**
 * 检查是否是代码文件
 */
function isCodeFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return CODE_EXTENSIONS.includes(ext);
}

/**
 * 检查目录是否应该被排除
 */
function shouldExcludeDir(dirname) {
  return EXCLUDE_DIRS.includes(dirname);
}

/**
 * 递归统计目录下的代码行数
 */
function countLinesInDirectory(dirPath, stats = { files: [], totalLines: 0, totalFiles: 0 }) {
  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // 如果是目录且不在排除列表中，则递归统计
        if (!shouldExcludeDir(item)) {
          countLinesInDirectory(fullPath, stats);
        }
      } else if (stat.isFile() && isCodeFile(item)) {
        // 如果是代码文件，统计行数
        const lines = countFileLines(fullPath);
        stats.files.push({
          path: fullPath,
          lines: lines
        });
        stats.totalLines += lines;
        stats.totalFiles += 1;
      }
    }
  } catch (err) {
    console.error(`读取目录失败: ${dirPath}`, err.message);
  }

  return stats;
}

/**
 * 格式化输出结果
 */
function formatResults(stats, targetDir) {
  console.log('\n' + '='.repeat(80));
  console.log(`📊 代码行数统计报告`);
  console.log('='.repeat(80));
  console.log(`📁 目标目录: ${path.resolve(targetDir)}`);
  console.log(`📄 文件总数: ${stats.totalFiles}`);
  console.log(`📝 代码总行数: ${stats.totalLines.toLocaleString()}`);
  console.log('='.repeat(80));

  if (stats.files.length === 0) {
    console.log('\n⚠️  未找到任何代码文件');
    return;
  }

  // 按行数排序
  const sortedFiles = stats.files.sort((a, b) => b.lines - a.lines);

  // 按扩展名分组统计
  const byExtension = {};
  sortedFiles.forEach(file => {
    const ext = path.extname(file.path) || '无扩展名';
    if (!byExtension[ext]) {
      byExtension[ext] = { count: 0, lines: 0 };
    }
    byExtension[ext].count += 1;
    byExtension[ext].lines += file.lines;
  });

  // 输出按扩展名分组的统计
  console.log('\n📊 按文件类型统计:');
  console.log('-'.repeat(80));
  const sortedExtensions = Object.entries(byExtension).sort((a, b) => b[1].lines - a[1].lines);
  sortedExtensions.forEach(([ext, data]) => {
    const percentage = ((data.lines / stats.totalLines) * 100).toFixed(1);
    console.log(`  ${ext.padEnd(10)} ${String(data.count).padStart(4)} 个文件  ${String(data.lines).padStart(6)} 行  (${percentage}%)`);
  });

  // 输出前 20 个最大的文件
  console.log('\n📈 前 20 个最大的文件:');
  console.log('-'.repeat(80));
  const topFiles = sortedFiles.slice(0, 20);
  topFiles.forEach((file, index) => {
    const relativePath = path.relative(process.cwd(), file.path);
    const percentage = ((file.lines / stats.totalLines) * 100).toFixed(1);
    console.log(`  ${String(index + 1).padStart(2)}. ${String(file.lines).padStart(6)} 行  (${percentage.padStart(5)}%)  ${relativePath}`);
  });

  // 如果有更多文件，显示省略信息
  if (sortedFiles.length > 20) {
    console.log(`  ... 还有 ${sortedFiles.length - 20} 个文件`);
  }

  console.log('\n' + '='.repeat(80));
  console.log(`✨ 统计完成!`);
  console.log('='.repeat(80) + '\n');
}

/**
 * 主函数
 */
function main() {
  // 获取目标目录（从命令行参数或默认使用 src）
  const targetDir = process.argv[2] || 'src';

  // 检查目录是否存在
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ 错误: 目录 "${targetDir}" 不存在`);
    console.log('\n使用方法:');
    console.log('  node scripts/count-lines.js [目录路径]');
    console.log('\n示例:');
    console.log('  node scripts/count-lines.js src');
    console.log('  node scripts/count-lines.js .');
    process.exit(1);
  }

  const stat = fs.statSync(targetDir);
  if (!stat.isDirectory()) {
    console.error(`❌ 错误: "${targetDir}" 不是一个目录`);
    process.exit(1);
  }

  console.log(`\n🔍 正在扫描目录: ${path.resolve(targetDir)} ...\n`);

  // 开始统计
  const startTime = Date.now();
  const stats = countLinesInDirectory(targetDir);
  const endTime = Date.now();

  // 输出结果
  formatResults(stats, targetDir);

  // 输出耗时
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.log(`⏱️  耗时: ${duration} 秒\n`);
}

// 运行主函数
main();
