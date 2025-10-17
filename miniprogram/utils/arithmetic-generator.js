// utils/arithmetic-generator.js
class ArithmeticGenerator {
  /**
   * 生成加减法题目
   */
  static generateProblems(count = 50, maxNumber = 100) {
    const problems = [];
    
    for (let i = 0; i < count; i++) {
      const type = Math.random() > 0.5 ? '+' : '-';
      let num1, num2, answer;
      
      if (type === '+') {
        // 加法：确保和在100以内
        num1 = Math.floor(Math.random() * (maxNumber - 1)) + 1;
        num2 = Math.floor(Math.random() * (maxNumber - num1)) + 1;
        answer = num1 + num2;
      } else {
        // 减法：确保结果为正数
        num1 = Math.floor(Math.random() * (maxNumber - 1)) + 2;
        num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
        answer = num1 - num2;
      }
      
      problems.push({
        id: i + 1,
        num1,
        num2,
        operator: type,
        answer,
        expression: `${num1} ${type} ${num2} = `
      });
    }
    
    return problems;
  }
}

module.exports = ArithmeticGenerator;