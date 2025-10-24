// 投诉详情组件
const ComplaintDetail = {
    template: `
        <div class="container">
            <!-- 头部 -->
            <div class="header">
                <h1>投诉详情</h1>
                <p>投诉编号：{{ complaintId }}</p>
            </div>
            
            <!-- 加载状态 -->
            <div v-if="loading" style="text-align: center; padding: 40px;">
                <div class="loading" style="margin: 0 auto 15px;"></div>
                <p>正在加载投诉详情...</p>
            </div>
            
            <!-- 错误信息 -->
            <div v-if="error" class="alert alert-error">
                {{ error }}
            </div>
            
            <!-- 投诉详情 -->
            <div v-if="complaint && !loading" class="complaint-detail">
                <!-- 状态 -->
                <div class="detail-item">
                    <div class="detail-label">当前状态</div>
                    <div class="detail-content">
                        <span :class="'status-badge status-' + complaint.status">
                            {{ getStatusText(complaint.status) }}
                        </span>
                    </div>
                </div>
                
                <!-- 投诉类型 -->
                <div class="detail-item">
                    <div class="detail-label">投诉类型</div>
                    <div class="detail-content">{{ complaint.type_name }}</div>
                </div>
                
                <!-- 联系电话 -->
                <div class="detail-item">
                    <div class="detail-label">联系电话</div>
                    <div class="detail-content">{{ maskPhone(complaint.phone) }}</div>
                </div>
                
                <!-- 投诉内容 -->
                <div class="detail-item">
                    <div class="detail-label">投诉内容</div>
                    <div class="detail-content" style="white-space: pre-wrap;">{{ complaint.content }}</div>
                </div>
                
                <!-- 相关图片 -->
                <div v-if="complaint.images && complaint.images.length > 0" class="detail-item">
                    <div class="detail-label">相关图片</div>
                    <div class="detail-content">
                        <div class="image-preview">
                            <div v-for="(image, index) in complaint.images" :key="index" class="image-item">
                                <img :src="image" :alt="'图片 ' + (index + 1)" @click="previewImage(image)">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 提交时间 -->
                <div class="detail-item">
                    <div class="detail-label">提交时间</div>
                    <div class="detail-content">{{ formatDate(complaint.created_at) }}</div>
                </div>
                
                <!-- 处理进度 -->
                <div v-if="complaint.progress && complaint.progress.length > 0" class="detail-item">
                    <div class="detail-label">处理进度</div>
                    <div class="detail-content">
                        <div class="progress-timeline">
                            <div 
                                v-for="(item, index) in complaint.progress" 
                                :key="index" 
                                class="progress-item"
                            >
                                <div class="progress-time">{{ formatDate(item.created_at) }}</div>
                                <div class="progress-content">{{ item.content }}</div>
                                <div v-if="item.operator" class="progress-operator">处理人：{{ item.operator }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 操作按钮 -->
                <div class="form-actions">
                    <button @click="goBack" class="btn btn-secondary">返回</button>
                    <button @click="refresh" class="btn btn-primary">刷新状态</button>
                </div>
            </div>
            
            <!-- 图片预览模态框 -->
            <div v-if="previewImageUrl" class="image-modal" @click="closeImagePreview">
                <div class="image-modal-content">
                    <img :src="previewImageUrl" alt="图片预览">
                    <button class="image-modal-close" @click="closeImagePreview">×</button>
                </div>
            </div>
        </div>
    `,
    
    data() {
        return {
            complaint: null,
            loading: true,
            error: null,
            previewImageUrl: null
        };
    },
    
    computed: {
        complaintId() {
            return window.app?.routeParams?.id || '';
        }
    },
    
    methods: {
        // 加载投诉详情
        async loadComplaintDetail() {
            if (!this.complaintId) {
                this.error = '投诉编号无效';
                this.loading = false;
                return;
            }
            
            this.loading = true;
            this.error = null;
            
            try {
                const response = await Http.get(API_CONFIG.endpoints.complaintDetail, {
                    complaint_id: this.complaintId
                });
                
                if (response.code === 1) {
                    this.complaint = response.data;
                    
                    // 处理图片数据
                    if (this.complaint.images) {
                        this.complaint.images = this.complaint.images.split(',').filter(img => img);
                    }
                } else {
                    this.error = response.msg || '加载投诉详情失败';
                }
            } catch (error) {
                this.error = '网络错误，请稍后重试';
            } finally {
                this.loading = false;
            }
        },
        
        // 获取状态文本
        getStatusText(status) {
            const statusMap = {
                'pending': '待处理',
                'processing': '处理中', 
                'resolved': '已解决',
                'closed': '已关闭'
            };
            return statusMap[status] || '未知状态';
        },
        
        // 手机号脱敏
        maskPhone(phone) {
            if (!phone || phone.length < 7) return phone;
            return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
        },
        
        // 格式化日期
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        // 预览图片
        previewImage(imageUrl) {
            this.previewImageUrl = imageUrl;
        },
        
        // 关闭图片预览
        closeImagePreview() {
            this.previewImageUrl = null;
        },
        
        // 刷新数据
        async refresh() {
            await this.loadComplaintDetail();
        },
        
        // 返回
        goBack() {
            Router.back();
        }
    },
    
    async mounted() {
        await this.loadComplaintDetail();
    }
};

// 导出组件
window.ComplaintDetail = ComplaintDetail;