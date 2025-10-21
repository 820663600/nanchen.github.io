// 投诉通知组件
const ComplaintNotice = {
    template: `
        <div class="container">
            <!-- 头部 -->
            <div class="header">
                <h1>投诉须知</h1>
                <p>请仔细阅读以下投诉流程和注意事项</p>
            </div>
            
            <!-- 投诉流程 -->
            <div class="notice-section">
                <h2>📋 投诉流程</h2>
                <div class="process-steps">
                    <div class="process-step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>填写投诉信息</h3>
                            <p>请详细填写您的联系方式、投诉类型和具体内容</p>
                        </div>
                    </div>
                    
                    <div class="process-step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h3>提交投诉</h3>
                            <p>系统将为您生成唯一的投诉编号，请妥善保存</p>
                        </div>
                    </div>
                    
                    <div class="process-step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h3>等待处理</h3>
                            <p>我们将在24小时内联系您，并开始处理您的投诉</p>
                        </div>
                    </div>
                    
                    <div class="process-step">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <h3>跟进反馈</h3>
                            <p>我们会定期更新处理进度，直至问题得到妥善解决</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 注意事项 -->
            <div class="notice-section">
                <h2>⚠️ 注意事项</h2>
                <div class="notice-list">
                    <div class="notice-item">
                        <div class="notice-icon">📞</div>
                        <div class="notice-text">
                            <strong>联系方式务必真实有效</strong>
                            <p>请确保您提供的手机号码能够正常接听电话，我们将通过此号码与您联系</p>
                        </div>
                    </div>
                    
                    <div class="notice-item">
                        <div class="notice-icon">📝</div>
                        <div class="notice-text">
                            <strong>详细描述问题情况</strong>
                            <p>请尽可能详细地描述问题，包括时间、地点、涉及人员等具体信息</p>
                        </div>
                    </div>
                    
                    <div class="notice-item">
                        <div class="notice-icon">📷</div>
                        <div class="notice-text">
                            <strong>提供相关证据材料</strong>
                            <p>如有相关图片、截图等证据，请一并上传，有助于我们更好地处理您的投诉</p>
                        </div>
                    </div>
                    
                    <div class="notice-item">
                        <div class="notice-icon">🔒</div>
                        <div class="notice-text">
                            <strong>个人信息保护承诺</strong>
                            <p>我们严格保护您的个人信息，仅用于投诉处理，不会泄露给第三方</p>
                        </div>
                    </div>
                    
                    <div class="notice-item">
                        <div class="notice-icon">⏰</div>
                        <div class="notice-text">
                            <strong>处理时限说明</strong>
                            <p>一般投诉我们会在24小时内回应，复杂问题可能需要3-7个工作日</p>
                        </div>
                    </div>
                    
                    <div class="notice-item">
                        <div class="notice-icon">🚫</div>
                        <div class="notice-text">
                            <strong>恶意投诉说明</strong>
                            <p>请勿恶意投诉或提供虚假信息，我们保留追究法律责任的权利</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 联系方式 -->
            <div class="notice-section" v-if="config.customer_service_phone">
                <h2>📞 联系方式</h2>
                <div class="contact-info">
                    <div class="contact-item">
                        <span class="contact-label">客服电话：</span>
                        <span class="contact-value">{{ config.customer_service_phone }}</span>
                    </div>
                    <div class="contact-item">
                        <span class="contact-label">服务时间：</span>
                        <span class="contact-value">周一至周五 9:00-18:00</span>
                    </div>
                </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="form-actions">
                <button @click="startComplaint" class="btn btn-primary">
                    开始投诉
                </button>
            </div>
        </div>
    `,
    
    data() {
        return {
            config: {}
        };
    },
    
    methods: {
        // 加载配置信息
        async loadConfig() {
            try {
                const response = await Http.get(API_CONFIG.endpoints.config);
                if (response.code === 1) {
                    this.config = response.data;
                }
            } catch (error) {
                console.error('加载配置失败:', error);
            }
        },
        
        // 开始投诉
        startComplaint() {
            Router.push('/');
        }
    },
    
    async mounted() {
        await this.loadConfig();
    }
};

// 导出组件
window.ComplaintNotice = ComplaintNotice;