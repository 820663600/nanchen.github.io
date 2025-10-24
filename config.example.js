// 配置文件示例
// 复制此文件为 config.js 并修改相应配置

const CONFIG = {
    // 后端API基础地址（必须修改）
    API_BASE_URL: 'https://qyts.wosb.cn',
    
    // 企业信息（从URL路径中获取，无需修改）
    ENTERPRISE_ID: '', // 将从URL自动解析
    CHANNEL_SN: '',    // 将从URL自动解析
    
    // 功能开关
    FEATURES: {
        // 是否启用图片上传
        ENABLE_IMAGE_UPLOAD: true,
        
        // 是否启用投诉详情查看
        ENABLE_COMPLAINT_DETAIL: true,
        
        // 是否启用投诉须知页面
        ENABLE_COMPLAINT_NOTICE: true
    },
    
    // UI配置
    UI: {
        // 主题色
        PRIMARY_COLOR: '#007bff',
        
        // 成功色
        SUCCESS_COLOR: '#28a745',
        
        // 错误色
        ERROR_COLOR: '#dc3545',
        
        // 最大图片上传数量
        MAX_IMAGES: 9,
        
        // 单张图片最大大小（MB）
        MAX_IMAGE_SIZE: 5
    },
    
    // 文本配置
    TEXT: {
        // 网站标题
        SITE_TITLE: '投诉平台',
        
        // 网站描述
        SITE_DESCRIPTION: '我们重视您的每一个反馈，请详细描述您遇到的问题',
        
        // 提交按钮文字
        SUBMIT_BUTTON_TEXT: '提交投诉',
        
        // 成功提示文字
        SUCCESS_MESSAGE: '投诉提交成功'
    }
};

// 导出配置
window.APP_CONFIG = CONFIG;