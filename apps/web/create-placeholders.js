const fs = require('fs');
const path = require('path');
const path = require('path');

// 创建简单的SVG占位图片
const createSVGPlaceholder = (width, height, text, bgColor) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${bgColor}" stroke="#000000" stroke-width="2"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" font-weight="bold" 
        fill="#FFFFFF" stroke="#000000" stroke-width="0.5" text-anchor="middle" 
        dominant-baseline="middle">${text}</text>
</svg>`;
};

// 定义要创建的图片 (基于 Figma 设计稿实际尺寸)
const images = [
  // 建筑物
  { name: 'rocket-museum.png', width: 228, height: 247, text: 'ROCKET MUSEUM', color: '#A487BA' },
  { name: 'fork-cafe.png', width: 228, height: 247, text: 'FORK CAFE', color: '#D2691E' },
  { name: 'having-cake-store.png', width: 228, height: 247, text: 'CAKE STORE', color: '#CD853F' },
  
  // 火箭发射区
  { name: 'scaffold.png', width: 144, height: 84, text: 'SCAFFOLD', color: '#F2EC8A' },
  { name: 'king-octopus.png', width: 60, height: 60, text: 'OCTOPUS', color: '#F2EC8A' },
  { name: 'pow-fuel.png', width: 52, height: 54, text: 'POW FUEL', color: '#F2EC8A' },
  { name: 'rocket-platform.png', width: 212, height: 110, text: 'PLATFORM', color: '#D8BBF0' },
  { name: 'rocket.png', width: 212, height: 110, text: 'ROCKET', color: '#D8BBF0' },
  
  // 装饰元素
  { name: 'flower-group.png', width: 56, height: 64, text: 'FLOWERS', color: '#ACE392' },
  { name: 'fence-decoration.png', width: 144, height: 84, text: 'FENCE', color: '#8B4513' },
  { name: 'grass-decoration.png', width: 823, height: 176, text: 'GRASS', color: '#ACE392' },
  
  // UI面板
  { name: 'queue-panel.png', width: 368, height: 84, text: 'QUEUE PANEL', color: '#F2EC8A' },
  { name: 'checkpoint-table.png', width: 200, height: 76, text: 'CHECKPOINT', color: '#D8BBF0' },
  { name: 'announce-octopus.png', width: 80, height: 80, text: 'ANNOUNCE', color: '#F2EC8A' },
  
  // 标题元素
  { name: 'mempool-entrance-header.png', width: 202, height: 31, text: 'MEMPOOL ENTRANCE', color: '#664A3D' },
  { name: 'left-arrow.png', width: 24, height: 24, text: '←', color: '#664A3D' },
  { name: 'right-arrow.png', width: 24, height: 24, text: '→', color: '#664A3D' },
];

const assetsDir = path.join(__dirname, 'public', 'assets');

// 确保目录存在
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 创建SVG文件
images.forEach(({ name, width, height, text, color }) => {
  const svgContent = createSVGPlaceholder(width, height, text, color);
  const svgName = name.replace('.png', '.svg');
  const filePath = path.join(assetsDir, svgName);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`✓ Created ${svgName} (${width}x${height})`);
});

console.log('\n🎉 所有占位图片创建完成!');
console.log('\n📝 注意: 我创建的是SVG格式的占位图片。');
console.log('如果需要PNG格式，你可以:');
console.log('1. 先用这些SVG测试游戏效果');
console.log('2. 稍后从Figma导出真实的PNG图片替换');
