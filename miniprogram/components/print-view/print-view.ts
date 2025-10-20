// components/range-total/range-total.ts
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    problemList: { type: Array },
    column: { type: Number ,value: 2},
    pcolumn: { type: Number ,value: 2},
    rowGap: { type: Number ,value: 2},
  },

  /**
   * 组件的初始数据
   */
  data: {
    minWidth:''
  },
  attached() {
    this.setData({
      minWidth:  `calc(${100/this.properties.column}% - ${12*(this.properties.column-1)/this.properties.column}px)`
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    rePrint(){
      this.triggerEvent('beginPrint', {})
    },
    goPrint(){
      if(this.data.problemList && this.data.problemList.length>0){
        wx.setStorageSync("problemList",JSON.stringify(this.data.problemList))
        wx.navigateTo({
          url:  `/pages/arithmetic/arithmetic?column=${this.data.pcolumn}&rowGap=${this.data.rowGap}`
        })
      }else{
        wx.showToast({
          title: '先生成题目',
          icon: 'error',
          duration: 2000
        })
      }
    },
  }
})