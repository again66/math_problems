// pages/compute/tenFun/index.ts
Page({
  /**
   * 页面的初始数据
   */
  data: {
    num1: 6,
    num2: 7,
    num3:16,
    num4: 8,
  },

  onLoad() {
    wx.createSelectorQuery()
        .select('#tenPlayDemoCanvas') // 在 WXML 中填入的 id
        .fields({ node: true, size: true })
        .exec((res) => {
            // Canvas 对象
            const canvas = res[0].node
            // 渲染上下文
            const ctx = canvas.getContext('2d')

            // Canvas 画布的实际绘制宽高
            const width = res[0].width
            const height = res[0].height

            // 初始化画布大小
            const dpr = wx.getWindowInfo().pixelRatio
            canvas.width = width * dpr
            canvas.height = height * dpr
            ctx.scale(dpr, dpr)

            // 清空画布
            ctx.clearRect(0, 0, width, height)

            // 绘制红色正方形
            ctx.fillStyle = 'rgb(200, 0, 0)';
            ctx.fillRect(10, 10, 50, 50);

            // 绘制蓝色半透明正方形
            ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
            ctx.fillRect(30, 30, 50, 50);

            ctx.fillText("6",90,90)
        })
},
  
  playAddDemo(){
    
  },
  playSubDemo(){

  },
  playbySp(){
    wx.openChannelsActivity({
      finderUserName:"sphJAvaa4TqNigV",
      feedId:"export/UzFfAgtgekIEAQAAAAAARhcq5g8IsgAAAAstQy6ubaLX4KHWvLEZgBPE9aMkQ2JRBrqPzNPgMJoZA-fvI3tKln9q4sMXn6xE",
      nonceId:""
    })
  }
})