import { MathOperationAnalyzer, AdditionStep, SubtractionStep } from '../../../utils/MathOperationAnalyzer';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num1Array:[4,2,5],
    num2Array:[6,1,7],
    operator:'+',
    correctAnswerArray:[1,0,4,2],
    processSteps:[],
    processIndex:0,
    cloneElements:[],
    elementId:1000
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.beginProcess()
  },
  beginProcess(){
    //计算动画所需要的值，然后依次播放
    const steps = this.data.operator=="+" ? MathOperationAnalyzer.analyzeAddition(Number(this.data.num1Array.join("")), Number(this.data.num2Array.join(""))):MathOperationAnalyzer.analyzeSubtraction(Number(this.data.num1Array.join("")), Number(this.data.num2Array.join("")));
    this.setData({
      processSteps : steps,
      processIndex : 0
    })
    console.log(this.data.processSteps)
  },
  nextProcess(){
    const len = this.data.processSteps.length
    const nowIndex = this.data.processIndex+1>len ? 1 : this.data.processIndex+1
    this.setData({
      processIndex : nowIndex
    })
    
    const step = this.data.processSteps[len - nowIndex]
    console.log(step)
    this.playAnimation(len - nowIndex,step)
  },
  playAnimation(nowIndex,step){
    console.log(nowIndex,step)

    // 获取元素位置信息
    const query = wx.createSelectorQuery()
    query.select('#num1-'+(nowIndex-1)).boundingClientRect()
    query.exec((res) => {
      console.log(res[0]) // 包含left, top, width, height等信息
    })
    this.moveCloneElement('num1-'+(nowIndex-1),'res-'+(nowIndex-1))
  },

  // 获取元素位置
  getElementPosition(selector) {
    return new Promise((resolve) => {
      const query = wx.createSelectorQuery();
      query.select(selector).boundingClientRect();
      query.exec((res) => {
        console.log(selector,res)
        resolve(res[0]);
      });
    });
  },

  // 获取元素文本内容
  getElementText(selector) {
    return new Promise((resolve) => {
      const query = wx.createSelectorQuery();
      query.select(selector).context((res) => {
        // 对于text元素，可能需要通过dataset或其他方式获取文本
        // 这里假设文本内容存储在dataset.text中
        resolve(res.dataset?.text || '');
      });
    });
  },

  // 移动克隆元素
  async moveCloneElement(originalId, targetId) {
    try {
      // 获取原始元素位置和文本内容
      const [originalRect, originalText] = await Promise.all([
        this.getElementPosition('#' + originalId),
        this.getOriginalElementText(originalId) // 新增方法获取文本
      ]);
      
      console.log(originalRect, originalText);
      
      // 创建复制元素
      const cloneId = 'clone_' + this.data.elementId++;
      const cloneElement = {
        id: cloneId,
        text: originalText, // 使用原始元素的文本内容
        startX: originalRect.left,
        startY: originalRect.top,
        animationClass: ''
      };
      
      // 添加到克隆元素数组
      this.setData({
        cloneElements: [...this.data.cloneElements, cloneElement]
      });
      
      // 获取目标位置
      const targetRect = await this.getElementPosition('#' + targetId);
      
      // 找到目标位置，开始播放动画
      setTimeout(() => {
        this.setData({
          [`cloneElements[${this.findCloneIndex(cloneId)}].animationClass`]: 'animated'
        });
        
        // 使用setTimeout触发CSS过渡动画（设置移动的目标位置）
        setTimeout(() => {
          this.setData({
            [`cloneElements[${this.findCloneIndex(cloneId)}].startX`]: targetRect.left,
            [`cloneElements[${this.findCloneIndex(cloneId)}].startY`]: targetRect.top
          });
          
          // 动画完成后删除元素
          setTimeout(() => {
            this.removeCloneElement(cloneId);
          }, 800); // 与CSS过渡时间保持一致
        }, 50);
      }, 50);
    } catch (error) {
      console.error('动画播放失败:', error);
    }
  },

  // 新增方法：获取原始元素的文本内容
  getOriginalElementText(elementId) {
    return new Promise((resolve) => {
      // 根据你的实际数据结构来获取文本
      // 方法1：如果文本在data中
      if (elementId.startsWith('num1-')) {
        const index = parseInt(elementId.split('-')[1]);
        if (index >= 0 && index < this.data.num1Array.length) {
          resolve(this.data.num1Array[index].toString());
          return;
        }
      } else if (elementId.startsWith('num2-')) {
        const index = parseInt(elementId.split('-')[1]);
        if (index >= 0 && index < this.data.num2Array.length) {
          resolve(this.data.num2Array[index].toString());
          return;
        }
      } else if (elementId.startsWith('res-')) {
        const index = parseInt(elementId.split('-')[1]);
        if (index >= 0 && index < this.data.correctAnswerArray.length) {
          resolve(this.data.correctAnswerArray[index].toString());
          return;
        }
      }
      
      // 方法2：如果无法从data获取，尝试从DOM获取
      const query = wx.createSelectorQuery();
      query.select('#' + elementId).context((res) => {
        // 尝试获取文本内容
        // 注意：小程序中获取元素文本内容比较困难，通常需要提前存储在dataset中
        resolve(res.dataset?.text || res.dataset?.value || '');
      }).exec();
    });
  },

  // 查找克隆元素索引
  findCloneIndex(cloneId) {
    return this.data.cloneElements.findIndex(item => item.id === cloneId);
  },

  // 删除克隆元素
  removeCloneElement(cloneId) {
    // const updatedElements = this.data.cloneElements.filter(item => item.id !== cloneId);
    // this.setData({
    //   cloneElements: updatedElements
    // });
  }
})