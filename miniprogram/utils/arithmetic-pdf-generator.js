// utils/arithmetic-pdf-generator.js
class ArithmeticPDFGenerator {
  /**
   * 生成口算题图片（A4纸比例）
   */
  static generateImage(pageInstance, problems, options = {}) {
    return new Promise((resolve, reject) => {
      const {
        title = '练习题',
        showAnswers = false,
        pageNumber = 1,
        totalPages = 1,
        columns = 4,
        rowSpacing=1,
      } = options;

      // 使用页面中的canvas
      const query = wx.createSelectorQuery().in(pageInstance);
      query.select('#mathCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res[0]) {
            reject(new Error('Canvas 未找到'));
            return;
          }

          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const dpr = wx.getSystemInfoSync().pixelRatio;
          
          // A4纸尺寸：210mm × 297mm，按96dpi换算为像素
          const width = 794; // 210mm * 96 / 25.4 ≈ 794px
          const height = 1123; // 297mm * 96 / 25.4 ≈ 1123px
          
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);

          // 清空画布
          ctx.clearRect(0, 0, width, height);

          // 绘制背景
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);

          // 绘制标题
          ctx.fillStyle = '#333333';
          ctx.font = 'bold 24px "Microsoft YaHei"';
          ctx.textAlign = 'center';
          const pageTitle = showAnswers ? `${title} - 答案` : `${title} - 题目`;
          ctx.fillText(pageTitle, width / 2, 60);

          // 绘制页码信息
          ctx.font = '16px "Microsoft YaHei"';
          ctx.fillStyle = '#666666';
          ctx.fillText(`第${pageNumber}页/共${totalPages}页 • 共${problems.length}题 • ${showAnswers ? '答案' : '题目'}`, width / 2, 95);

          // 绘制题目
          ctx.textAlign = 'left';
          ctx.font = '20px "Microsoft YaHei"';
          
          const margin = 40;
          const contentWidth = width - 2 * margin;
          const colWidth = contentWidth / columns;
          const lineHeight = 50*rowSpacing; // 行高
          let y = 140; // 起始Y坐标

          problems.forEach((problem, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;
            const x = margin + col * colWidth;
            const currentY = y + row * lineHeight;

            // 检查是否需要换页（在绘制前检查）
            if (currentY + lineHeight > height - 10) {
              // 如果超出页面，应该分页处理，这里先简单处理
              console.warn('题目超出页面范围，需要分页');
            }

            let text = '';
            if (showAnswers) {
              text = `${index+1}. ${problem.problem}${problem.answer}`;
              ctx.fillStyle = '#2e7d32'; // 答案用绿色
            } else {
              text = `${problem.problem}____`;
              ctx.fillStyle = '#333333'; // 题目用黑色
            }

            // 绘制题目编号（灰色，较小）
            ctx.fillStyle = '#666666';
            ctx.font = '16px "Microsoft YaHei"';
            ctx.fillText(`${index+1}.`, x, currentY);
            
            // 绘制题目内容
            ctx.fillStyle = showAnswers ? '#2e7d32' : '#333333';
            ctx.font = '20px "Microsoft YaHei"';
            const textWidth = ctx.measureText(`${index+1}. `).width;
            ctx.fillText(showAnswers ? 
              `${problem.problem}${problem.answer}` : 
              `${problem.problem}`, 
              x + textWidth, currentY);
          });

          // 绘制底部信息
          ctx.font = '14px "Microsoft YaHei"';
          ctx.fillStyle = '#999999';
          ctx.textAlign = 'center';
          ctx.fillText(`${new Date().toLocaleDateString()} • ${title}`, width / 2, height - 30);

          // 绘制边框（可选）
          ctx.strokeStyle = '#e0e0e0';
          ctx.lineWidth = 1;
          ctx.strokeRect(10, 10, width - 20, height - 20);

          // 将canvas转换为图片
          setTimeout(() => {
            wx.canvasToTempFilePath({
              canvas: canvas,
              success: (res) => {
                resolve([res.tempFilePath]);
              },
              fail: (error) => {
                reject(error);
              }
            }, pageInstance);
          }, 300);
        });
    });
  }

  /**
   * 智能分页生成图片
   */
  static generateAllImages(pageInstance, problems, options) {
    return new Promise(async (resolve, reject) => {
      try {
        const { columns = 4,rowSpacing=1 } = options;
        const allImages = [];
        
        // 计算每页能放多少题目
        const problemsPerPage = this.calculateProblemsPerPage(columns,rowSpacing);
        
        // 分页处理
        const totalPages = Math.ceil(problems.length / problemsPerPage);
        
        console.log(`总题目数: ${problems.length}, 每页: ${problemsPerPage}, 总页数: ${totalPages}`);

        // 生成题目图片
        for (let i = 0; i < totalPages; i++) {
          const start = i * problemsPerPage;
          const end = start + problemsPerPage;
          const pageProblems = problems.slice(start, end);
          
          console.log(`生成题目页 ${i + 1}: ${start + 1}-${end}题`);
          
          const imagePaths = await this.generateImage(pageInstance, pageProblems, {
            ...options,
            showAnswers: false,
            pageNumber: i + 1,
            totalPages: totalPages,
            columns: columns
          });
          
          allImages.push(...imagePaths);
          
          // 更新进度
          const progress = Math.round(((i + 1) / (totalPages * 2)) * 100);
          pageInstance.setData({ imageProgress: progress });
          
          // 延迟一下，避免生成太快
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 生成答案图片
        for (let i = 0; i < totalPages; i++) {
          const start = i * problemsPerPage;
          const end = start + problemsPerPage;
          const pageProblems = problems.slice(start, end);
          
          console.log(`生成答案页 ${i + 1}: ${start + 1}-${end}题`);
          
          const imagePaths = await this.generateImage(pageInstance, pageProblems, {
            ...options,
            showAnswers: true,
            pageNumber: i + 1,
            totalPages: totalPages,
            columns: columns
          });
          
          allImages.push(...imagePaths);
          
          // 更新进度
          const progress = Math.round(((totalPages + i + 1) / (totalPages * 2)) * 100);
          pageInstance.setData({ imageProgress: progress });
          
          // 延迟一下，避免生成太快
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`所有图片生成完成，共 ${allImages.length} 张`);
        resolve(allImages);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 计算每页题目数量
   */
  static calculateProblemsPerPage(columns,rowSpacing) {
    // A4纸可用的行数
    const usableHeight = 1123 - 140 - 10; // 总高度 - 标题区域 - 底部区域
    const lineHeight = 50*rowSpacing; // 每行高度
    const rowsPerPage = Math.floor(usableHeight / lineHeight);
    
    return rowsPerPage * columns;
  }

  /**
   * 保存图片到相册
   */
  static saveImagesToAlbum(imagePaths) {
    return new Promise((resolve, reject) => {
      let savedCount = 0;
      const total = imagePaths.length;

      const saveNext = () => {
        if (savedCount >= total) {
          resolve(imagePaths);
          return;
        }

        wx.saveImageToPhotosAlbum({
          filePath: imagePaths[savedCount],
          success: () => {
            savedCount++;
            if (savedCount < total) {
              saveNext();
            } else {
              resolve(imagePaths);
            }
          },
          fail: (error) => {
            console.error('保存图片失败:', error);
            savedCount++;
            if (savedCount < total) {
              saveNext();
            } else {
              resolve(imagePaths);
            }
          }
        });
      };

      saveNext();
    });
  }

  /**
   * 生成预览数据
   */
  static generatePreview(problems, options = {}) {
    const { showAnswers = false, columns = 4,rowSpacing=1 } = options;
    
    const problemsPerPage = this.calculateProblemsPerPage(columns,rowSpacing);
    const problemPages = Math.ceil(problems.length / problemsPerPage);
    const answerStartPage = problemPages + 1;
    
    return {
      problems: this.formatForPreview(problems, columns, false),
      answers: this.formatForPreview(problems, columns, true),
      total: problems.length,
      problemPages,
      answerStartPage,
      hasAnswers: showAnswers
    };
  }

  /**
   * 格式化预览数据
   */
  static formatForPreview(problems, columns, showAnswers) {
    const rows = [];
    for (let i = 0; i < problems.length; i += columns) {
      const row = problems.slice(i, i + columns).map(problem => ({
        ...problem,
        display: showAnswers ? 
          `${problem.problem}${problem.answer}` : 
          `${problem.problem}____`
      }));
      rows.push(row);
    }
    return rows;
  }
}

module.exports = ArithmeticPDFGenerator;