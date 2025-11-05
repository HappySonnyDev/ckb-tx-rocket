/**
 * 手续费率工具模块
 * 提供手续费率计算、分档、动物映射等功能
 */

/**
 * 动物类型枚举
 */
export enum AnimalType {
  TURTLE = 'turtle',  // 乌龟 - 低手续费
  PIG = 'pig',        // 猪 - 中手续费
  RABBIT = 'rabbit'   // 兔子 - 高手续费
}

/**
 * 手续费率分档配置
 */
export interface FeeRateThresholds {
  /** 33%分位数 */
  p33: number;
  /** 66%分位数 */
  p66: number;
}

/**
 * 静态阈值配置（样本不足时使用）
 */
export const STATIC_THRESHOLDS = {
  low: 0.5,   // 低档阈值
  high: 1.5   // 高档阈值
} as const;

/**
 * 最小样本数量（低于此值使用静态阈值）
 */
export const MIN_SAMPLE_SIZE = 10;

/**
 * 计算数组的百分位数
 * @param values 数值数组
 * @param percentile 百分位 (0-100)
 * @returns 百分位数值
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (lower === upper) {
    return sorted[lower];
  }

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * 计算手续费率的分档阈值
 * @param feeRates 手续费率数组
 * @returns 分档阈值配置，如果样本不足返回 null
 */
export function calculateFeeRateThresholds(feeRates: number[]): FeeRateThresholds | null {
  if (feeRates.length < MIN_SAMPLE_SIZE) {
    return null;
  }

  const p33 = calculatePercentile(feeRates, 33);
  const p66 = calculatePercentile(feeRates, 66);

  return { p33, p66 };
}

/**
 * 根据手续费率获取对应的动物类型
 * @param feeRate 手续费率
 * @param thresholds 分档阈值（可选，不传则使用静态阈值）
 * @returns 动物类型
 */
export function getAnimalTypeByFeeRate(
  feeRate: number,
  thresholds?: FeeRateThresholds | null
): AnimalType {
  // 使用动态阈值
  if (thresholds) {
    if (feeRate < thresholds.p33) {
      return AnimalType.TURTLE;
    } else if (feeRate < thresholds.p66) {
      return AnimalType.PIG;
    } else {
      return AnimalType.RABBIT;
    }
  }

  // 回退到静态阈值
  if (feeRate < STATIC_THRESHOLDS.low) {
    return AnimalType.TURTLE;
  } else if (feeRate < STATIC_THRESHOLDS.high) {
    return AnimalType.PIG;
  } else {
    return AnimalType.RABBIT;
  }
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
 * 批量处理交易的手续费率分档
 * @param transactions 交易数组（包含feeRate字段）
 * @returns 分档结果
 */
export function classifyTransactionsByFeeRate<T extends { feeRate: number }>(
  transactions: T[]
): {
  thresholds: FeeRateThresholds | null;
  classified: Map<AnimalType, T[]>;
  stats: {
    total: number;
    turtle: number;
    pig: number;
    rabbit: number;
  };
} {
  const feeRates = transactions.map(tx => tx.feeRate);
  const thresholds = calculateFeeRateThresholds(feeRates);

  const classified = new Map<AnimalType, T[]>([
    [AnimalType.TURTLE, []],
    [AnimalType.PIG, []],
    [AnimalType.RABBIT, []]
  ]);

  const stats = {
    total: transactions.length,
    turtle: 0,
    pig: 0,
    rabbit: 0
  };

  transactions.forEach(tx => {
    const animalType = getAnimalTypeByFeeRate(tx.feeRate, thresholds);
    classified.get(animalType)!.push(tx);
    
    if (animalType === AnimalType.TURTLE) stats.turtle++;
    else if (animalType === AnimalType.PIG) stats.pig++;
    else if (animalType === AnimalType.RABBIT) stats.rabbit++;
  });

  return { thresholds, classified, stats };
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
  p33: number;
  p66: number;
  count: number;
} {
  if (feeRates.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      median: 0,
      p33: 0,
      p66: 0,
      count: 0
    };
  }

  const sorted = [...feeRates].sort((a, b) => a - b);
  const sum = feeRates.reduce((acc, val) => acc + val, 0);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / feeRates.length,
    median: calculatePercentile(feeRates, 50),
    p33: calculatePercentile(feeRates, 33),
    p66: calculatePercentile(feeRates, 66),
    count: feeRates.length
  };
}

/**
 * 判断是否应该使用动态阈值
 * @param sampleSize 样本数量
 * @returns 是否使用动态阈值
 */
export function shouldUseDynamicThresholds(sampleSize: number): boolean {
  return sampleSize >= MIN_SAMPLE_SIZE;
}
