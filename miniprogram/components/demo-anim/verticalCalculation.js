class VerticalCalculation {
  constructor(num1, num2, operation = 'addition', canvasId = 'calculationCanvas') {
    this.num1 = num1;
    this.num2 = num2;
    this.operation = operation;
    this.canvasId = canvasId;
    
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
    
    // Canvas上下文
    this.ctx = null;
    
    // 动态计算布局
    this.calculateLayout();
  }
  
  // 动态计算布局
  calculateLayout() {
    this.canvasWidth = 650;
    this.canvasHeight = 500;
    
    if (this.maxLength <= 3) {
      this.digitWidth = 40;
      this.lineHeight = 50;
      this.startX = 150;
    } else if (this.maxLength <= 5) {
      this.digitWidth = 35;
      this.lineHeight = 45;
      this.startX = 120;
    } else {
      this.digitWidth = 30;
      this.lineHeight = 40;
      this.startX = 80;
    }
    
    this.startY = 80;
  }
  
  // 初始化Canvas
  initCanvas(component) {
    this.ctx = wx.createCanvasContext(this.canvasId, component);
    this.drawStaticFrame();
    return this.ctx;
  }
  
  // 绘制静态框架
  drawStaticFrame() {
    if (!this.ctx) return;
    
    // 清空画布
    this.ctx.setFillStyle('#ffffff');
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // 设置字体和颜色
    this.ctx.setFontSize(28);
    this.ctx.setFillStyle('#333333');
    this.ctx.setLineWidth(2);
    
    // 绘制运算符
    const operatorX = 50;
    const operatorY = this.startY + this.lineHeight;
    this.ctx.fillText(this.operation === 'addition' ? '+' : '-', operatorX, operatorY);
    
    // 绘制横线
    const lineStartX = 40;
    const lineEndX = this.startX + this.maxLength * this.digitWidth + 20;
    const lineY = this.startY + 2 * this.lineHeight;
    
    this.ctx.beginPath();
    this.ctx.moveTo(lineStartX, lineY);
    this.ctx.lineTo(lineEndX, lineY);
    this.ctx.stroke();
    
    // 绘制数字（右对齐）
    // 第一个数字
    for (let i = 0; i < this.num1Str.length; i++) {
      const xPos = this.startX + (this.maxLength - this.num1Str.length + i) * this.digitWidth;
      this.ctx.fillText(this.num1Str[i], xPos, this.startY);
    }
    
    // 第二个数字
    for (let i = 0; i < this.num2Str.length; i++) {
      const xPos = this.startX + (this.maxLength - this.num2Str.length + i) * this.digitWidth;
      this.ctx.fillText(this.num2Str[i], xPos, this.startY + this.lineHeight);
    }
    
    this.ctx.draw(true);
  }
  
  // 重新绘制所有内容（包括结果和进位标记）
  redrawAll() {
    if (!this.ctx) return;
    
    // 清空画布
    this.ctx.setFillStyle('#ffffff');
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // 设置字体和颜色
    this.ctx.setFontSize(28);
    this.ctx.setFillStyle('#333333');
    this.ctx.setLineWidth(2);
    
    // 绘制运算符
    const operatorX = 50;
    const operatorY = this.startY + this.lineHeight;
    this.ctx.fillText(this.operation === 'addition' ? '+' : '-', operatorX, operatorY);
    
    // 绘制横线 - 考虑结果可能比原始数字长
    const lineStartX = 40;
    const totalDigits = Math.max(this.maxLength, this.result ? this.result.length : 0);
    const lineEndX = this.startX + totalDigits * this.digitWidth + 20;
    const lineY = this.startY + 2 * this.lineHeight;
    
    this.ctx.beginPath();
    this.ctx.moveTo(lineStartX, lineY);
    this.ctx.lineTo(lineEndX, lineY);
    this.ctx.stroke();
    
    // 绘制数字（右对齐）- 使用totalDigits确保对齐
    // 第一个数字
    for (let i = 0; i < this.num1Str.length; i++) {
      const xPos = this.startX + (totalDigits - this.num1Str.length + i) * this.digitWidth;
      this.ctx.fillText(this.num1Str[i], xPos, this.startY);
    }
    
    // 第二个数字
    for (let i = 0; i < this.num2Str.length; i++) {
      const xPos = this.startX + (totalDigits - this.num2Str.length + i) * this.digitWidth;
      this.ctx.fillText(this.num2Str[i], xPos, this.startY + this.lineHeight);
    }
    
    // 绘制结果数字
    this.ctx.setFillStyle('#e74c3c');
    if (this.result && this.result.length > 0) {
      for (let i = 0; i < this.result.length; i++) {
        // 从右向左计算位置
        const digitIndexFromRight = this.result.length - 1 - i;
        const xPos = this.startX + (totalDigits - 1 - digitIndexFromRight) * this.digitWidth;
        const yPos = this.startY + 3 * this.lineHeight;
        this.ctx.fillText(this.result[i], xPos, yPos);
      }
    }
    
    // 绘制进位标记
    this.carryPositions.forEach(({ x, y, mark, color, isActive }) => {
      if (isActive) {
        this.ctx.setFillStyle(color);
        this.ctx.setFontSize(20);
      } else {
        const lightColor = this.lightenColor(color, 0.6);
        this.ctx.setFillStyle(lightColor);
        this.ctx.setFontSize(16);
      }
      this.ctx.fillText(mark, x, y);
    });
    
    this.ctx.draw(true);
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
    console.log(`nextStep: stepIndex=${this.stepIndex}, maxLength=${this.maxLength}, waitingForAnimation=${this.waitingForAnimation}, carry=${this.carry}`);
    
    if (this.waitingForAnimation) {
      console.log("完成动画");
      return this.completeAnimation();
    }
    
    // 检查是否完成所有步骤
    if (this.stepIndex >= this.maxLength) {
      console.log("步骤已完成，检查最终进位");
      if (this.carry > 0 && this.operation === 'addition') {
        console.log("处理最终进位");
        return this.handleFinalCarry();
      } else {
        console.log("完成计算");
        return this.finishCalculation();
      }
    }
    
    // 将上一步的进位标记设为非活跃状态
    this.deactivatePreviousCarry();
    
    const i = this.stepIndex;
    const digit1 = this.getDigit(this.num1Str, i);
    const digit2 = this.getDigit(this.num2Str, i);
    
    console.log(`执行步骤 ${i}: digit1=${digit1}, digit2=${digit2}`);
    
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
    
    console.log(`加法步骤: ${digit1} + ${digit2} + ${this.carry} = ${sum}, 当前位=${currentDigit}, 进位=${newCarry}`);
    
    // 记录步骤
    const stepDescription = `第${this.stepIndex+1}步: ${digit1} + ${digit2}${this.carry > 0 ? ` + ${this.carry} (进位)` : ''} = ${sum}, 当前位写${currentDigit}`;
    this.steps.push(stepDescription);
    
    // 更新结果状态
    this.updateCalculationState(currentDigit, newCarry);
    
    // 如果有进位，设置动画状态
    if (newCarry > 0) {
      console.log("有进位，等待动画");
      this.waitingForAnimation = true;
      this.tempData = {
        type: 'carry',
        carry: newCarry,
        stepIndex: i
      };
      
      // 先绘制当前结果
      this.redrawAll();
      
      return {
        step: stepDescription,
        hasMore: true,
        waitingForAnimation: true
      };
    } else {
      console.log("无进位，继续下一步");
      // 没有进位，直接绘制
      this.redrawAll();
      
      return {
        step: stepDescription,
        hasMore: this.stepIndex < this.maxLength || this.carry > 0,
        waitingForAnimation: false
      };
    }
  }
  
  // 执行减法步骤
  performSubtractionStep(i, digit1, digit2) {
    const needBorrow = digit1 < digit2 + this.carry;
    const currentDigit = needBorrow ? digit1 + 10 - digit2 - this.carry : digit1 - digit2 - this.carry;
    const newCarry = needBorrow ? 1 : 0;
    
    console.log(`减法步骤: ${digit1} - ${digit2} - ${this.carry}, 需要借位=${needBorrow}, 当前位=${currentDigit}, 借位=${newCarry}`);
    
    // 记录步骤
    const stepDescription = `第${this.stepIndex+1}步: ${digit1} - ${digit2}${this.carry > 0 ? ` - ${this.carry} (借位)` : ''}`;
    this.steps.push(stepDescription);
    
    // 如果需要借位，先显示借位
    if (needBorrow) {
      console.log("需要借位，等待动画");
      this.waitingForAnimation = true;
      this.tempData = {
        type: 'borrow',
        carry: newCarry,
        result: currentDigit,
        stepIndex: i,
        digit1, digit2
      };
      
      return {
        step: stepDescription + `，需要借位`,
        hasMore: true,
        waitingForAnimation: true
      };
    } else {
      console.log("无需借位，直接计算");
      // 不需要借位，直接显示结果
      this.updateCalculationState(currentDigit, newCarry);
      this.redrawAll();
      
      const finalStepDescription = stepDescription + ` = ${currentDigit}, 当前位写${currentDigit}`;
      this.steps[this.steps.length - 1] = finalStepDescription;
      
      return {
        step: finalStepDescription,
        hasMore: this.stepIndex < this.maxLength,
        waitingForAnimation: false
      };
    }
  }
  
  // 完成动画（进位/借位）
  completeAnimation() {
    const { type, carry, result, stepIndex, digit1, digit2 } = this.tempData;
    
    console.log(`完成动画: type=${type}, carry=${carry}, stepIndex=${stepIndex}`);
    
    if (type === 'carry') {
      // 绘制进位标记
      this.drawCarryMark(stepIndex, `+${carry}`, '#3498db');
      const carryStep = `进位${carry}已添加到上一位`;
      this.steps.push(carryStep);
      
      // 重绘所有内容
      this.redrawAll();
      
      this.waitingForAnimation = false;
      this.tempData = {};
      
      return {
        step: carryStep,
        hasMore: this.stepIndex < this.maxLength || this.carry > 0,
        waitingForAnimation: false
      };
    } else {
      // 显示借位
      this.drawCarryMark(stepIndex, `-${carry}`, '#e67e22');
      
      // 更新结果状态并绘制
      this.updateCalculationState(result, carry);
      this.redrawAll();
      
      const resultStep = `${digit1} + 10 - ${digit2}${carry > 0 ? ` - ${carry}` : ''} = ${result}, 当前位写${result}`;
      this.steps.push(resultStep);
      
      this.waitingForAnimation = false;
      this.tempData = {};
      
      return {
        step: resultStep,
        hasMore: this.stepIndex < this.maxLength,
        waitingForAnimation: false
      };
    }
  }
  
  // 绘制进位/借位标记
  drawCarryMark(i, mark, color) {
    const totalDigits = Math.max(this.maxLength, this.result ? this.result.length : 0);
    const x = this.startX + (totalDigits - 2 - i) * this.digitWidth - 10;
    const y = this.startY - 25;
    
    // 保存进位标记信息
    this.carryPositions.push({
      x, y, mark, color,
      isActive: true
    });
  }
  
  // 更新计算状态
  updateCalculationState(resultDigit, newCarry) {
    this.result = resultDigit.toString() + this.result;
    this.carry = newCarry;
    this.stepIndex++;
    
    console.log(`更新状态: result=${this.result}, carry=${this.carry}, stepIndex=${this.stepIndex}`);
  }
  
  // 处理最终进位（加法）
  handleFinalCarry() {
    console.log(`处理最终进位: carry=${this.carry}, result=${this.result}`);
    
    // 保存当前结果，然后添加进位
    const finalResultValue = this.carry.toString() + this.result;
    this.result = finalResultValue;
    
    // 重新绘制最终结果
    this.redrawAll();
    
    const finalStep = `最后进位: ${this.carry}`;
    this.steps.push(finalStep);
    
    return {
      step: finalStep,
      hasMore: false,
      waitingForAnimation: false,
      finalResult: `${this.num1} + ${this.num2} = ${finalResultValue}`
    };
  }
  
  // 完成计算
  finishCalculation() {
    console.log(`完成计算: result=${this.result}`);
    
    this.redrawAll();
    
    const finalResultText = `计算完成! ${this.num1} ${this.operation === 'addition' ? '+' : '-'} ${this.num2} = ${this.result}`;
    this.steps.push(finalResultText);
    
    return {
      step: finalResultText,
      hasMore: false,
      waitingForAnimation: false,
      finalResult: finalResultText
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
    this.drawStaticFrame();
  }
}

module.exports = VerticalCalculation;