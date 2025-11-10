import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🗑️  开始清理数据库...\n');

  try {
    // 按照依赖关系顺序删除数据
    // 先删除子表，后删除父表

    console.log('清理 Output 表...');
    const outputCount = await prisma.output.deleteMany();
    console.log(`✅ 已删除 ${outputCount.count} 条 Output 记录`);

    console.log('清理 Input 表...');
    const inputCount = await prisma.input.deleteMany();
    console.log(`✅ 已删除 ${inputCount.count} 条 Input 记录`);

    console.log('清理 HeaderDep 表...');
    const headerDepCount = await prisma.headerDep.deleteMany();
    console.log(`✅ 已删除 ${headerDepCount.count} 条 HeaderDep 记录`);

    console.log('清理 CellDep 表...');
    const cellDepCount = await prisma.cellDep.deleteMany();
    console.log(`✅ 已删除 ${cellDepCount.count} 条 CellDep 记录`);

    console.log('清理 Script 表...');
    const scriptCount = await prisma.script.deleteMany();
    console.log(`✅ 已删除 ${scriptCount.count} 条 Script 记录`);

    console.log('清理 Transaction 表...');
    const txCount = await prisma.transaction.deleteMany();
    console.log(`✅ 已删除 ${txCount.count} 条 Transaction 记录`);

    console.log('清理 Block 表...');
    const blockCount = await prisma.block.deleteMany();
    console.log(`✅ 已删除 ${blockCount.count} 条 Block 记录`);

    console.log('\n✨ 数据库清理完成！');
    console.log(`总计删除:`);
    console.log(`  - Blocks: ${blockCount.count}`);
    console.log(`  - Transactions: ${txCount.count}`);
    console.log(`  - Outputs: ${outputCount.count}`);
    console.log(`  - Inputs: ${inputCount.count}`);
    console.log(`  - Scripts: ${scriptCount.count}`);
    console.log(`  - CellDeps: ${cellDepCount.count}`);
    console.log(`  - HeaderDeps: ${headerDepCount.count}`);
  } catch (error) {
    console.error('❌ 清理数据库时出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
clearDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
