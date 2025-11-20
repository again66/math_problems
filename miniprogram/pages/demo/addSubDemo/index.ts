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
  }
})