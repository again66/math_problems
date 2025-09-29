export const multiplicationSteps = (multiplicand, multiplier) => {
  
  // 参数校验
  if (!Number.isInteger(multiplicand) || !Number.isInteger(multiplier)) {
      throw new Error('Both arguments must be integers');
  }
  if (multiplicand < 0 || multiplier < 0) {
      throw new Error('Arguments must be non-negative');
  }

  const multiplicandStr = String(multiplicand);
  const multiplierDigits = String(multiplier).split('').reverse(); // 从个位开始处理
  const partialProducts = [];
  let totalSum = 0;

  // 遍历乘数的每一位（从个位开始）
  for (let i = 0; i < multiplierDigits.length; i++) {
      const steps = [];
      const multiplierDigit = parseInt(multiplierDigits[i], 10);
      const currentPartialProduct = [];
      let carry = 0,carryIn=0;


      // 从右往左遍历被乘数的每一位（模拟竖式写法）
      for (let j = multiplicandStr.length - 1; j >= 0; j--) {
          const multiplicandDigit = parseInt(multiplicandStr[j], 10);
          const product = multiplicandDigit * multiplierDigit + carry;
          const currentDigit = product % 10;
          carry = Math.floor(product / 10);

          // 记录当前位的计算细节
          steps.push({
              operation: `${multiplierDigit} × ${multiplicandDigit}`,
              rawProduct: product,
              currentDigit: currentDigit,
              carryOver: carry,
              carryIn: carryIn,
              position: `第 ${j + 1} 位（从个位起）`,
              phase: `乘数的第 ${i + 1} 位（${multiplierDigit}）`
          });
          carryIn = carry

          currentPartialProduct.unshift(currentDigit); // 插入到前面形成正确顺序
      }

      // 如果还有剩余进位，添加到最前端
      while (carry > 0) {
          currentPartialProduct.unshift(carry % 10);
          carry = Math.floor(carry / 10);
          steps.push({
              operation: '进位',
              rawProduct: carryIn,
              currentDigit: carryIn,
              carryOver: Math.floor(carry / 10),
              carryIn: carryIn,
              position: '最高位前',
              phase: `乘数的第 ${i + 1} 位（${multiplierDigit}）`
          });
      }

      // 将部分积转换为数字并存储
      const partialProductValue = parseInt(currentPartialProduct.join(''), 10);
      partialProducts.push({
          value: partialProductValue,
          shiftedValue: partialProductValue * Math.pow(10, i),
          shiftPositionStr: `左移 ${i} 位`,
          shiftPosition: i,
          multiplicand: multiplicand,
          multiplier: multiplierDigit,
          detailSteps:steps.reverse()
      });

      // 累加到总和
      totalSum += partialProductValue * Math.pow(10, i);
  }

  return {
      steps: partialProducts,
      total: totalSum
  }
}