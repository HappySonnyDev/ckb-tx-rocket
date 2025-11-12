/**
 * 手续费率工具模块
 * 提供手续费率计算、分档、动物映射等功能
 * 基于实际数据分析的固定档位配置
 */

/**
 * 动物类型枚举
 */
export enum AnimalType {
  TURTLE = 'turtle', // 乌龟 - 低手续费
  PIG = 'pig', // 猪 - 中手续费
  RABBIT = 'rabbit', // 兔子 - 高手续费
}

/**
 * 动物大小枚举
 */
export enum AnimalSize {
  SMALL = 32,   // 小动物 32x32
  MEDIUM = 44,  // 中动物 44x44
  LARGE = 56,   // 大动物 56x56
}

/**
 * 手续费率固定档位配置（基于 P33 和 P66 百分位数）
 * 数据来源：分析了 8249 笔交易的 fee/size 比值
 * - P33: 3.0288 shannon/byte
 * - P66: 4.0930 shannon/byte
 */
export const FEE_RATE_TIERS = {
  /** 乌龟档位最大值（< 此值为乌龟） */
  TURTLE_MAX: 3.0288,
  /** 猪档位最大值（>= TURTLE_MAX 且 < 此值为猪） */
  PIG_MAX: 4.0930,
  /** 兔子档位（>= PIG_MAX 为兔子） */
} as const;

/**
 * 乌龟大小细分档位（基于乌龟交易内部的 P33 和 P66 百分位数）
 */
export const TURTLE_SIZE_TIERS = {
  SMALL_MAX: 2.0191,   // 32x32
  MEDIUM_MAX: 2.6122,  // 44x44
  // >= MEDIUM_MAX: 56x56
} as const;

/**
 * 猪大小细分档位（基于猪交易内部的 P33 和 P66 百分位数）
 */
export const PIG_SIZE_TIERS = {
  SMALL_MAX: 3.3437,   // 32x32
  MEDIUM_MAX: 3.6953,  // 44x44
  // >= MEDIUM_MAX: 56x56
} as const;

/**
 * 兔子大小细分档位（基于兔子交易内部的 P33 和 P66 百分位数）
 */
export const RABBIT_SIZE_TIERS = {
  SMALL_MAX: 4.5465,   // 32x32
  MEDIUM_MAX: 5.0282,  // 44x44
  // >= MEDIUM_MAX: 56x56
} as const;

/**
 * 根据手续费率获取对应的动物类型（使用固定档位）
 * @param feeRate 手续费率 (shannon/byte)
 * @returns 动物类型
 */
export function getAnimalTypeByFeeRate(feeRate: number): AnimalType {
  if (feeRate < FEE_RATE_TIERS.TURTLE_MAX) {
    return AnimalType.TURTLE;
  } else if (feeRate < FEE_RATE_TIERS.PIG_MAX) {
    return AnimalType.PIG;
  } else {
    return AnimalType.RABBIT;
  }
}

/**
 * 根据动物类型和手续费率获取动物大小
 * @param animalType 动物类型
 * @param feeRate 手续费率 (shannon/byte)
 * @returns 动物大小（像素）
 */
export function getAnimalSize(animalType: AnimalType, feeRate: number): AnimalSize {
  switch (animalType) {
    case AnimalType.TURTLE:
      if (feeRate < TURTLE_SIZE_TIERS.SMALL_MAX) {
        return AnimalSize.SMALL;
      } else if (feeRate < TURTLE_SIZE_TIERS.MEDIUM_MAX) {
        return AnimalSize.MEDIUM;
      } else {
        return AnimalSize.LARGE;
      }
    case AnimalType.PIG:
      if (feeRate < PIG_SIZE_TIERS.SMALL_MAX) {
        return AnimalSize.SMALL;
      } else if (feeRate < PIG_SIZE_TIERS.MEDIUM_MAX) {
        return AnimalSize.MEDIUM;
      } else {
        return AnimalSize.LARGE;
      }
    case AnimalType.RABBIT:
      if (feeRate < RABBIT_SIZE_TIERS.SMALL_MAX) {
        return AnimalSize.SMALL;
      } else if (feeRate < RABBIT_SIZE_TIERS.MEDIUM_MAX) {
        return AnimalSize.MEDIUM;
      } else {
        return AnimalSize.LARGE;
      }
  }
}

/**
 * 获取动物类型的档位范围描述
 * @param animalType 动物类型
 * @returns 档位范围文本
 */
export function getAnimalFeeRateRange(animalType: AnimalType): string {
  const ranges: Record<AnimalType, string> = {
    [AnimalType.TURTLE]: `< ${FEE_RATE_TIERS.TURTLE_MAX}`,
    [AnimalType.PIG]: `${FEE_RATE_TIERS.TURTLE_MAX} ~ ${FEE_RATE_TIERS.PIG_MAX}`,
    [AnimalType.RABBIT]: `≥ ${FEE_RATE_TIERS.PIG_MAX}`,
  };
  return ranges[animalType];
}

/**
 * 获取动物类型的显示名称
 * @param animalType 动物类型
 * @returns 中文显示名称
 */
export function getAnimalDisplayName(animalType: AnimalType): string {
  const displayNames: Record<AnimalType, string> = {
    [AnimalType.TURTLE]: '乌龟',
    [AnimalType.PIG]: '猪',
    [AnimalType.RABBIT]: '兔子'
  };
  return displayNames[animalType];
}

/**
 * 获取动物类型的描述
 * @param animalType 动物类型
 * @returns 描述文本
 */
export function getAnimalDescription(animalType: AnimalType): string {
  const descriptions: Record<AnimalType, string> = {
    [AnimalType.TURTLE]: '低手续费，处理速度较慢',
    [AnimalType.PIG]: '中等手续费，处理速度适中',
    [AnimalType.RABBIT]: '高手续费，优先处理'
  };
  return descriptions[animalType];
}

/**
 * 获取动物类型的颜色（用于UI展示）
 * @param animalType 动物类型
 * @returns 十六进制颜色值
 */
export function getAnimalColor(animalType: AnimalType): string {
  const colors: Record<AnimalType, string> = {
    [AnimalType.TURTLE]: '#4CAF50',  // 绿色
    [AnimalType.PIG]: '#FF9800',     // 橙色
    [AnimalType.RABBIT]: '#F44336'   // 红色
  };
  return colors[animalType];
}

/**
 * 格式化手续费率显示
 * @param feeRate 手续费率
 * @param decimals 小数位数，默认2位
 * @returns 格式化后的字符串
 */
export function formatFeeRate(feeRate: number, decimals: number = 2): string {
  return feeRate.toFixed(decimals);
}

/**
 * 批量处理交易的手续费率分档（使用固定档位）
 * @param transactions 交易数组（包含 feeRate 字段）
 * @returns 分档结果
 */
export function classifyTransactionsByFeeRate<T extends { feeRate: number }>(
  transactions: T[],
): {
  classified: Map<AnimalType, T[]>;
  stats: {
    total: number;
    turtle: number;
    pig: number;
    rabbit: number;
  };
} {
  const classified = new Map<AnimalType, T[]>([
    [AnimalType.TURTLE, []],
    [AnimalType.PIG, []],
    [AnimalType.RABBIT, []],
  ]);

  const stats = {
    total: transactions.length,
    turtle: 0,
    pig: 0,
    rabbit: 0,
  };

  transactions.forEach((tx) => {
    const animalType = getAnimalTypeByFeeRate(tx.feeRate);
    classified.get(animalType)!.push(tx);

    if (animalType === AnimalType.TURTLE) stats.turtle++;
    else if (animalType === AnimalType.PIG) stats.pig++;
    else if (animalType === AnimalType.RABBIT) stats.rabbit++;
  });

  return { classified, stats };
}

/**
 * 获取手续费率的统计信息
 * @param feeRates 手续费率数组
 * @returns 统计信息
 */
export function getFeeRateStatistics(feeRates: number[]): {
  min: number;
  max: number;
  avg: number;
  median: number;
  count: number;
  tierDistribution: {
    turtle: number;
    pig: number;
    rabbit: number;
  };
} {
  if (feeRates.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      median: 0,
      count: 0,
      tierDistribution: {
        turtle: 0,
        pig: 0,
        rabbit: 0,
      },
    };
  }

  const sorted = [...feeRates].sort((a, b) => a - b);
  const sum = feeRates.reduce((acc, val) => acc + val, 0);

  // 计算档位分布
  const tierDistribution = {
    turtle: feeRates.filter((rate) => rate < FEE_RATE_TIERS.TURTLE_MAX).length,
    pig: feeRates.filter(
      (rate) => rate >= FEE_RATE_TIERS.TURTLE_MAX && rate < FEE_RATE_TIERS.PIG_MAX,
    ).length,
    rabbit: feeRates.filter((rate) => rate >= FEE_RATE_TIERS.PIG_MAX).length,
  };

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / feeRates.length,
    median: sorted[Math.floor(sorted.length / 2)],
    count: feeRates.length,
    tierDistribution,
  };
}
