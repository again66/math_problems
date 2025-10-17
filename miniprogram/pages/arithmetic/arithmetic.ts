// pages/arithmetic/arithmetic.js
const ArithmeticGenerator = require('../../utils/arithmetic-generator.js');
const ArithmeticPDFGenerator = require('../../utils/arithmetic-pdf-generator.js');

Page({
  data: {
    // 配置参数
    config: {
      problemCount: 100,
      maxNumber: 100,
      lineSpacing: 2,
      fontSize: 14,
      columns: 3
    },
    problems: [],
    previewData: {
      problems: [],
      answers: [],
      total: 0,
      problemPages: 0,
      answerStartPage: 0
    },
    generating: false,
    previewMode: 'problems',
    showPageInfo: true,
    generatingImages: false,
    imageProgress: 0,
    generatedImages: [],
    showCanvas: false,
    // 新增：控制图片显示
    showGeneratedImages: false,
    currentImageIndex: 0
  },

  onLoad() {
    this.generateProblems();
  },

  onReady() {
    setTimeout(() => {
      this.setData({ showCanvas: true });
    }, 1000);
  },

  // 生成题目
  generateProblems() {
    const { problemCount, maxNumber } = this.data.config;
    
    this.setData({ generating: true });
    
    setTimeout(() => {
      const problems = ArithmeticGenerator.generateProblems(problemCount, maxNumber);
      const previewData = ArithmeticPDFGenerator.generatePreview(problems, this.data.config);
      
      this.setData({
        problems,
        previewData,
        generating: false,
        generatedImages: [],
        showGeneratedImages: false // 重置图片显示状态
      });
    }, 300);
  },

  // 更新配置
  updateConfig(e) {
    const { field } = e.currentTarget.dataset;
    let value = e.detail.value;
    
    if (field === 'problemCount' || field === 'maxNumber' || field === 'fontSize' || field === 'columns') {
      value = parseInt(value) || 1;
    } else if (field === 'lineSpacing') {
      value = parseFloat(value) || 1.0;
    }
    
    this.setData({
      [`config.${field}`]: value
    }, () => {
      this.generateProblems();
    });
  },

  // 生成图片
  async generateImages() {
    const { problems, config } = this.data;
    
    if (problems.length === 0) {
      wx.showToast({
        title: '请先生成题目',
        icon: 'none'
      });
      return;
    }

    this.setData({ 
      generatingImages: true,
      imageProgress: 0,
      showCanvas: true,
      showGeneratedImages: false // 先隐藏，生成完成后再显示
    });

    try {
      wx.showLoading({
        title: '正在生成图片...',
        mask: true
      });

      // 等待canvas渲染
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 生成所有图片
      const allImages = await ArithmeticPDFGenerator.generateAllImages(this, problems, config);
      
      this.setData({
        generatedImages: allImages,
        imageProgress: 100,
        showGeneratedImages: true, // 生成完成后显示图片
        currentImageIndex: 0 // 默认显示第一张
      });

      wx.hideLoading();

      // 隐藏canvas
      this.setData({ showCanvas: false });

      wx.showToast({
        title: `生成${allImages.length}张图片`,
        icon: 'success'
      });
      this.setData({ 
        generatingImages: false,
        showCanvas: false 
      });
    } catch (error) {
      console.error('生成图片失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '生成失败: ' + error.message,
        icon: 'error'
      });
      this.setData({ 
        generatingImages: false,
        showCanvas: false 
      });
    }
  },

  // 保存所有图片到相册
  async saveAllImagesToAlbum() {
    const { generatedImages } = this.data;
    
    if (generatedImages.length === 0) {
      wx.showToast({
        title: '没有可保存的图片',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    
    try {
      // 请求相册权限
      await this.requestAlbumPermission();
      
      // 保存图片
      await ArithmeticPDFGenerator.saveImagesToAlbum(generatedImages);
      
      wx.hideLoading();
      wx.showToast({
        title: `已保存${generatedImages.length}张图片`,
        icon: 'success',
        duration: 2000
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  // 保存单张图片到相册
  async saveCurrentImage() {
    const { generatedImages, currentImageIndex } = this.data;
    
    if (generatedImages.length === 0) {
      wx.showToast({
        title: '没有可保存的图片',
        icon: 'none'
      });
      return;
    }

    const currentImage = generatedImages[currentImageIndex];
    
    wx.showLoading({ title: '保存中...' });
    
    try {
      // 请求相册权限
      await this.requestAlbumPermission();
      
      // 保存单张图片
      await new Promise((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
          filePath: currentImage,
          success: resolve,
          fail: reject
        });
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '图片已保存',
        icon: 'success',
        duration: 1500
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  // 请求相册权限
  requestAlbumPermission() {
    return new Promise((resolve, reject) => {
      wx.authorize({
        scope: 'scope.writePhotosAlbum',
        success: resolve,
        fail: () => {
          wx.showModal({
            title: '需要相册权限',
            content: '请允许访问相册以保存图片',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    if (res.authSetting['scope.writePhotosAlbum']) {
                      resolve();
                    } else {
                      reject(new Error('用户拒绝授权'));
                    }
                  }
                });
              } else {
                reject(new Error('用户取消授权'));
              }
            }
          });
        }
      });
    });
  },

  // 切换图片
  switchImage(e) {
    const { direction } = e.currentTarget.dataset;
    const { generatedImages, currentImageIndex } = this.data;
    
    let newIndex = currentImageIndex;
    if (direction === 'prev') {
      newIndex = currentImageIndex - 1;  // 修复：使用 currentImageIndex
      if (newIndex < 0) newIndex = generatedImages.length - 1;
    } else {
      newIndex = currentImageIndex + 1;  // 修复：使用 currentImageIndex
      if (newIndex >= generatedImages.length) newIndex = 0;
    }
    
    this.setData({ currentImageIndex: newIndex });
  },

  // 直接跳转到某张图片
  goToImage(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({ currentImageIndex: index });
  },

  // 预览当前图片（大图模式）
  previewCurrentImage() {
    const { generatedImages, currentImageIndex } = this.data;
    if (generatedImages.length > 0) {
      wx.previewImage({
        urls: generatedImages,
        current: generatedImages[currentImageIndex]
      });
    }
  },

  // 切换预览模式
  switchPreviewMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ previewMode: mode });
  },

  togglePageInfo() {
    this.setData({ showPageInfo: !this.data.showPageInfo });
  },

  setQuickCount(e) {
    const count = parseInt(e.currentTarget.dataset.count);
    this.setData({
      'config.problemCount': count
    }, () => {
      this.generateProblems();
    });
  },

  onColumnsChange(e) {
    const index = parseInt(e.detail.value);
    const columns = [2, 3, 4, 5][index];
    this.setData({
      'config.columns': columns
    }, () => {
      this.generateProblems();
    });
  }
});