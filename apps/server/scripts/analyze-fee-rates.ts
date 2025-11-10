import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeFeeRates() {
  try {
    console.log('正在分析交易手续费率...\n');

    // 先检查数据库中所有交易的状态
    const totalCount = await prisma.transaction.count();
    const statusCounts = await prisma.transaction.groupBy({
      by: ['status'],
      _count: true,
    });

    console.log(`数据库中共有 ${totalCount} 条交易记录`);
    console.log('状态分布:');
    statusCounts.forEach((s) => {
      console.log(`  ${s.status}: ${s._count} 条`);
    });
    console.log();

    // 查询所有交易（不限状态）
    const transactions = await prisma.transaction.findMany({
      where: {
        size: {
          gt: 0,
        },
      },
      select: {
        hash: true,
        fee: true,
        size: true,
        status: true,
      },
    });

    if (transactions.length === 0) {
      console.log('数据库中没有找到交易数据');
      return;
    }

    console.log(`共找到 ${transactions.length} 条交易记录\n`);

    // 计算每笔交易的 feeRate (shannon per byte)
    const feeRates = transactions.map((tx) => {
      const feeRate = Number(tx.fee) / Number(tx.size);
      return {
        hash: tx.hash,
        fee: Number(tx.fee),
        size: Number(tx.size),
        feeRate,
      };
    });

    // 排序
    const sortedFeeRates = feeRates.sort((a, b) => a.feeRate - b.feeRate);

    // 计算统计信息
    const min = sortedFeeRates[0].feeRate;
    const max = sortedFeeRates[sortedFeeRates.length - 1].feeRate;
    const sum = feeRates.reduce((acc, tx) => acc + tx.feeRate, 0);
    const avg = sum / feeRates.length;
    const median =
      sortedFeeRates[Math.floor(sortedFeeRates.length / 2)].feeRate;

    // 计算百分位数
    const p10 = sortedFeeRates[Math.floor(sortedFeeRates.length * 0.1)].feeRate;
    const p25 =
      sortedFeeRates[Math.floor(sortedFeeRates.length * 0.25)].feeRate;
    const p33 =
      sortedFeeRates[Math.floor(sortedFeeRates.length * 0.33)].feeRate;
    const p50 = median;
    const p66 =
      sortedFeeRates[Math.floor(sortedFeeRates.length * 0.66)].feeRate;
    const p75 =
      sortedFeeRates[Math.floor(sortedFeeRates.length * 0.75)].feeRate;
    const p90 = sortedFeeRates[Math.floor(sortedFeeRates.length * 0.9)].feeRate;

    console.log('=== 手续费率统计 (shannon/byte) ===');
    console.log(`最小值: ${min.toFixed(4)}`);
    console.log(`最大值: ${max.toFixed(4)}`);
    console.log(`平均值: ${avg.toFixed(4)}`);
    console.log(`中位数: ${median.toFixed(4)}`);
    console.log();

    console.log('=== 百分位数 ===');
    console.log(`P10:  ${p10.toFixed(4)}`);
    console.log(`P25:  ${p25.toFixed(4)}`);
    console.log(`P33:  ${p33.toFixed(4)}`);
    console.log(`P50:  ${p50.toFixed(4)}`);
    console.log(`P66:  ${p66.toFixed(4)}`);
    console.log(`P75:  ${p75.toFixed(4)}`);
    console.log(`P90:  ${p90.toFixed(4)}`);
    console.log();

    // 显示前10条和后10条
    console.log('=== 最低手续费率的10笔交易 ===');
    sortedFeeRates.slice(0, 10).forEach((tx, i) => {
      console.log(
        `${i + 1}. ${tx.hash.substring(0, 10)}... - ${tx.feeRate.toFixed(4)} shannon/byte`,
      );
    });
    console.log();

    console.log('=== 最高手续费率的10笔交易 ===');
    sortedFeeRates
      .slice(-10)
      .reverse()
      .forEach((tx, i) => {
        console.log(
          `${i + 1}. ${tx.hash.substring(0, 10)}... - ${tx.feeRate.toFixed(4)} shannon/byte`,
        );
      });
    console.log();

    // 建议的档位
    console.log('=== 建议的固定档位 (基于P33和P66) ===');
    console.log(`🐢 乌龟 (低速): < ${p33.toFixed(4)} shannon/byte`);
    console.log(
      `🐷 猪 (中速):   ${p33.toFixed(4)} ~ ${p66.toFixed(4)} shannon/byte`,
    );
    console.log(`🐰 兔子 (高速): >= ${p66.toFixed(4)} shannon/byte`);
    console.log();

    // 按建议档位分类统计
    const turtle = sortedFeeRates.filter((tx) => tx.feeRate < p33).length;
    const pig = sortedFeeRates.filter(
      (tx) => tx.feeRate >= p33 && tx.feeRate < p66,
    ).length;
    const rabbit = sortedFeeRates.filter((tx) => tx.feeRate >= p66).length;

    console.log('=== 各档位分布 ===');
    console.log(
      `🐢 乌龟: ${turtle} 笔 (${((turtle / feeRates.length) * 100).toFixed(1)}%)`,
    );
    console.log(
      `🐷 猪:   ${pig} 笔 (${((pig / feeRates.length) * 100).toFixed(1)}%)`,
    );
    console.log(
      `🐰 兔子: ${rabbit} 笔 (${((rabbit / feeRates.length) * 100).toFixed(1)}%)`,
    );
    console.log();

    // 生成建议的代码配置
    console.log('=== 建议的代码配置 ===');
    console.log('export const FEE_RATE_TIERS = {');
    console.log(`  TURTLE_MAX: ${p33.toFixed(4)},  // 乌龟最大值`);
    console.log(`  PIG_MAX: ${p66.toFixed(4)},     // 猪最大值`);
    console.log('} as const;');
  } catch (error) {
    console.error('分析失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeFeeRates();
