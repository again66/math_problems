const VerticalCalculation = require('./verticalCalculation.js');

Component({
  properties: {
    num1: {
      type: Number,
      value: 503
    },
    num2: {
      type: Number,
      value: 278
    },
    operation: {
      type: String,
      value: 'subtraction'
    }
  },

  data: {
    calculator: null,
    steps: [],
    hasMore: true,
    isCalculating: false,
    finalResult: ''
  },

  lifetimes: {
    attached() {
      setTimeout(() => {
        this.initCalculation();
      }, 100);
    }
  },

  methods: {
    // 初始化计算
    initCalculation() {
      const { num1, num2, operation } = this.properties;
      
      // 创建计算器实例
      const calculator = new VerticalCalculation(num1, num2, operation);
      
      // 初始化Canvas
      calculator.initCanvas(this);
      
      this.setData({
        calculator,
        steps: [],
        hasMore: true,
        isCalculating: false,
        finalResult: ''
      });
    },

    // 下一步计算
    nextStep() {
      const { calculator, isCalculating } = this.data;
      
      if (!calculator || isCalculating) return;
      
      this.setData({ isCalculating: true });
      
      const result = calculator.nextStep();
      
      if (result) {
        // 更新步骤列表
        const steps = [...this.data.steps, result.step];
        
        const newData = {
          steps,
          currentStep: result.step,
          hasMore: result.hasMore,
          isCalculating: false
        };
        
        if (result.finalResult) {
          newData.finalResult = result.finalResult;
        }
        
        this.setData(newData);
        
        // 触发事件
        this.triggerEvent('stepchange', {
          step: result.step,
          hasMore: result.hasMore,
          isFinal: !!result.finalResult
        });
        
        // 如果有动画等待，自动继续
        if (result.waitingForAnimation) {
          setTimeout(() => {
            this.nextStep();
          }, 800);
        }
      } else {
        this.setData({ isCalculating: false });
      }
    },

    // 重置计算
    resetCalculation() {
      const { calculator } = this.data;
      if (calculator) {
        calculator.reset();
      }
      this.setData({
        steps: [],
        hasMore: true,
        isCalculating: false,
        finalResult: ''
      });
      this.triggerEvent('reset');
    }
  }
});