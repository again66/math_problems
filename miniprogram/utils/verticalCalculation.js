// verticalCalculation.js - 竖式计算工具类
class VerticalCalculation {
  constructor(num1, num2, operation = 'addition') {
    this.num1 = num1;
    this.num2 = num2;
    this.operation = operation;
    
    this.num1Str = num1.toString();
    this.num2Str = num2.toString();
    this.maxLength = Math.max(this.num1Str.length, this.num2Str.length);
    
    // 计算状态
    this.stepIndex = 0;
    this.carry = 0;
    this.result = '';
    this.waitingForAnimation = false;
    this.carryPositions = [];
    this.tempData = {};
    
    // 步骤记录
    this.steps = [];
  }
  
  // 获取数字
  getDigit(numberStr, index) {
    return index < numberStr.length ? parseInt(numberStr[numberStr.length - 1 - index]) : 0;
  }
  
  // 颜色变淡
  lightenColor(color, factor) {
    if (color === '#3498db') {
      return factor > 0.7 ? '#7fb3d5' : '#a6c5e0';
    } else if (color === '#e67e22') {
      return factor > 0.7 ? '#f0b27a' : '#f5cba7';
    }
    return color;
  }
  
  // 执行下一步计算
  nextStep() {
    if (this.waitingForAnimation) {
      return this.completeAnimation();
    }
    
    if (this.stepIndex >= this.maxLength) {
      if (this.carry > 0 && this.operation === 'addition') {
        return this.handleFinalCarry();
      } else {
        return this.finishCalculation();
      }
    }
    
    // 将上一步的进位标记设为非活跃状态
    this.deactivatePreviousCarry();
    
    const i = this.stepIndex;
    const digit1 = this.getDigit(this.num1Str, i);
    const digit2 = this.getDigit(this.num2Str, i);
    
    return this.operation === 'addition' 
      ? this.performAdditionStep(i, digit1, digit2)
      : this.performSubtractionStep(i, digit1, digit2);
  }
  
  // 将上一步的进位标记设为非活跃状态
  deactivatePreviousCarry() {
    if (this.carryPositions.length > 0) {
      const lastIndex = this.carryPositions.length - 1;
      if (this.carryPositions[lastIndex].isActive) {
        this.carryPositions[lastIndex].isActive = false;
      }
    }
  }
  
  // 执行加法步骤
  performAdditionStep(i, digit1, digit2) {
    const sum = digit1 + digit2 + this.carry;
    const currentDigit = sum % 10;
    const newCarry = Math.floor(sum / 10);
    
    // 记录步骤
    const stepDescription = `第${this.stepIndex+1}步: ${digit1} + ${digit2}${this.carry > 0 ? ` + ${this.carry} (进位)` : ''} = ${sum}, 当前位写${currentDigit}`;
    this.steps.push(stepDescription);
    
    // 如果有进位，设置动画状态
    if (newCarry > 0) {
      this.waitingForAnimation = true;
      this.tempData = {
        type: 'carry',
        carry: newCarry,
        result: currentDigit,
        stepIndex: i
      };
      
      return {
        step: stepDescription,
        hasMore: true,
        waitingForAnimation: true,
        currentDigit,
        position: i
      };
    } else {
      // 没有进位，直接进入下一步
      this.updateCalculationState(currentDigit, 0);
      
      return {
        step: stepDescription,
        hasMore: this.stepIndex < this.maxLength || this.carry > 0,
        waitingForAnimation: false,
        currentDigit,
        position: i
      };
    }
  }
  
  // 执行减法步骤
  performSubtractionStep(i, digit1, digit2) {
    const needBorrow = digit1 < digit2 + this.carry;
    const currentDigit = needBorrow ? digit1 + 10 - digit2 - this.carry : digit1 - digit2 - this.carry;
    
    // 记录步骤
    const stepDescription = `第${this.stepIndex+1}步: ${digit1} - ${digit2}${this.carry > 0 ? ` - ${this.carry} (借位)` : ''}`;
    this.steps.push(stepDescription);
    
    // 如果需要借位，先显示借位
    if (needBorrow) {
      this.waitingForAnimation = true;
      this.tempData = {
        type: 'borrow',
        carry: 1,
        result: currentDigit,
        stepIndex: i,
        digit1, digit2
      };
      
      return {
        step: stepDescription + `，需要借位`,
        hasMore: true,
        waitingForAnimation: true,
        position: i
      };
    } else {
      // 不需要借位，直接显示结果
      const finalStepDescription = stepDescription + ` = ${currentDigit}, 当前位写${currentDigit}`;
      this.steps[this.steps.length - 1] = finalStepDescription;
      
      this.updateCalculationState(currentDigit, 0);
      
      return {
        step: finalStepDescription,
        hasMore: this.stepIndex < this.maxLength,
        waitingForAnimation: false,
        currentDigit,
        position: i
      };
    }
  }
  
  // 完成动画（进位/借位）
  completeAnimation() {
    const { type, carry, result, stepIndex, digit1, digit2 } = this.tempData;
    const i = stepIndex;
    
    if (type === 'carry') {
      // 显示进位
      this.carryPositions.push({
        position: i,
        mark: `+${carry}`,
        color: '#3498db',
        isActive: true
      });
      
      const carryStep = `进位${carry}已添加到上一位`;
      this.steps.push(carryStep);
      
      this.updateCalculationState(result, carry);
      
      return {
        step: carryStep,
        hasMore: this.stepIndex < this.maxLength || this.carry > 0,
        waitingForAnimation: false,
        carryMark: {
          position: i,
          mark: `+${carry}`,
          color: '#3498db',
          isActive: true
        }
      };
    } else {
      // 显示借位
      this.carryPositions.push({
        position: i,
        mark: `-${carry}`,
        color: '#e67e22',
        isActive: true
      });
      
      const resultStep = `${digit1} + 10 - ${digit2}${this.carry > 0 ? ` - ${this.carry}` : ''} = ${result}, 当前位写${result}`;
      this.steps.push(resultStep);
      
      this.updateCalculationState(result, carry);
      
      return {
        step: resultStep,
        hasMore: this.stepIndex < this.maxLength,
        waitingForAnimation: false,
        currentDigit: result,
        position: i,
        carryMark: {
          position: i,
          mark: `-${carry}`,
          color: '#e67e22',
          isActive: true
        }
      };
    }
  }
  
  // 更新计算状态
  updateCalculationState(resultDigit, newCarry) {
    this.result = resultDigit.toString() + this.result;
    this.carry = newCarry;
    this.stepIndex++;
    this.waitingForAnimation = false;
    this.tempData = {};
  }
  
  // 处理最终进位（加法）
  handleFinalCarry() {
    this.result = this.carry.toString() + this.result;
    
    const finalStep = `最后进位: ${this.carry}`;
    this.steps.push(finalStep);
    
    return {
      step: finalStep,
      hasMore: false,
      waitingForAnimation: false,
      finalResult: `${this.num1} + ${this.num2} = ${this.result}`,
      finalDigits: this.result.split('').map((digit, index) => ({
        digit,
        position: this.result.length - 1 - index
      }))
    };
  }
  
  // 完成计算
  finishCalculation() {
    const finalResult = `计算完成! ${this.num1} ${this.operation === 'addition' ? '+' : '-'} ${this.num2} = ${this.result}`;
    this.steps.push(finalResult);
    
    return {
      step: finalResult,
      hasMore: false,
      waitingForAnimation: false,
      finalResult: finalResult,
      finalDigits: this.result.split('').map((digit, index) => ({
        digit,
        position: this.result.length - 1 - index
      }))
    };
  }
  
  // 获取计算基础信息
  getCalculationInfo() {
    return {
      num1: this.num1Str,
      num2: this.num2Str,
      operator: this.operation === 'addition' ? '+' : '-',
      maxLength: this.maxLength,
      carryPositions: this.carryPositions
    };
  }
  
  // 获取所有步骤
  getAllSteps() {
    return this.steps;
  }
  
  // 重置计算
  reset() {
    this.stepIndex = 0;
    this.carry = 0;
    this.result = '';
    this.waitingForAnimation = false;
    this.carryPositions = [];
    this.tempData = {};
    this.steps = [];
  }
}

module.exports = VerticalCalculation;