// 投诉表单组件
const ComplaintForm = {
    template: `
        <div class="container">
            <!-- 头部 -->
            <div class="header">
                <h1>{{ config.system_name || '投诉平台' }}</h1>
                <p>我们重视您的每一个反馈，请详细描述您遇到的问题</p>
            </div>
            
            <!-- 全局消息提示 -->
            <div v-if="message" :class="'alert alert-' + message.type">
                {{ message.text }}
            </div>
            
            <!-- 投诉表单 -->
            <form @submit.prevent="submitComplaint" v-if="!submitted">
                <!-- 联系方式 -->
                <div class="form-group">
                    <label class="form-label required">联系电话</label>
                    <input 
                        type="tel" 
                        v-model="form.phone" 
                        class="form-input" 
                        placeholder="请输入您的手机号码"
                        maxlength="11"
                        required
                    >
                    <div class="form-help">我们将通过此号码与您联系，请确保号码正确</div>
                </div>
                
                <!-- 投诉类型 -->
                <div class="form-group">
                    <label class="form-label required">投诉类型</label>
                    <select v-model="form.type_id" class="form-select" required>
                        <option value="">请选择投诉类型</option>
                        <option 
                            v-for="type in complaintTypes" 
                            :key="type.id" 
                            :value="type.id"
                        >
                            {{ type.name }}
                        </option>
                    </select>
                </div>
                
                <!-- 投诉内容 -->
                <div class="form-group">
                    <label class="form-label required">投诉内容</label>
                    <textarea 
                        v-model="form.content" 
                        class="form-textarea" 
                        placeholder="请详细描述您的问题，包括时间、地点、具体情况等"
                        maxlength="1000"
                        required
                    ></textarea>
                    <div class="form-help">{{ form.content.length }}/1000 字</div>
                </div>
                
                <!-- 图片上传 -->
                <div class="form-group" v-if="config.require_image_upload">
                    <label class="form-label" :class="{ required: config.image_upload_required }">
                        相关图片
                    </label>
                    <div 
                        class="upload-area" 
                        :class="{ dragover: dragover }"
                        @click="triggerFileInput"
                        @drop.prevent="handleDrop"
                        @dragover.prevent="dragover = true"
                        @dragleave.prevent="dragover = false"
                    >
                        <div class="upload-icon">📷</div>
                        <div class="upload-text">
                            点击选择图片或拖拽图片到此处
                        </div>
                        <div class="upload-limit">
                            支持 JPG、PNG 格式，单张图片不超过 5MB，最多上传 {{ maxImages }} 张
                        </div>
                    </div>
                    
                    <input 
                        type="file" 
                        ref="fileInput"
                        @change="handleFileSelect"
                        accept="image/jpeg,image/png,image/jpg"
                        multiple
                        style="display: none;"
                    >
                    
                    <!-- 图片预览 -->
                    <div v-if="form.images.length > 0" class="image-preview">
                        <div v-for="(image, index) in form.images" :key="index" class="image-item">
                            <img :src="image.preview" :alt="'图片 ' + (index + 1)">
                            <button 
                                type="button" 
                                class="image-remove" 
                                @click="removeImage(index)"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                    
                    <div v-if="config.image_upload_required && form.images.length === 0" class="form-help">
                        请上传至少一张相关图片
                    </div>
                </div>
                
                <!-- 提交按钮 -->
                <div class="form-actions">
                    <button 
                        type="submit" 
                        class="btn btn-primary"
                        :disabled="submitting || !isFormValid"
                    >
                        <span v-if="submitting" class="loading"></span>
                        {{ submitting ? '提交中...' : '提交投诉' }}
                    </button>
                </div>
            </form>
            
            <!-- 提交成功页面 -->
            <div v-if="submitted" class="complaint-success">
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 64px; color: #28a745; margin-bottom: 20px;">✅</div>
                    <h2 style="color: #28a745; margin-bottom: 15px;">投诉提交成功</h2>
                    <p style="color: #666; margin-bottom: 20px;">
                        投诉编号：<strong>{{ complaintId }}</strong>
                    </p>
                    <p style="color: #666; margin-bottom: 30px;">
                        我们已收到您的投诉，将在 24 小时内与您联系处理
                    </p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button @click="viewComplaint" class="btn btn-primary">
                            查看投诉详情
                        </button>
                        <button @click="submitAnother" class="btn btn-secondary">
                            继续投诉
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    data() {
        return {
            config: {},
            complaintTypes: [],
            form: {
                phone: '',
                type_id: '',
                content: '',
                images: []
            },
            message: null,
            submitting: false,
            submitted: false,
            complaintId: '',
            dragover: false,
            maxImages: 9
        };
    },
    
    computed: {
        isFormValid() {
            const baseValid = this.form.phone && this.form.type_id && this.form.content;
            
            if (this.config.image_upload_required) {
                return baseValid && this.form.images.length > 0;
            }
            
            return baseValid;
        }
    },
    
    methods: {
        // 初始化数据
        async initData() {
            try {
                // 获取系统配置
                const configResponse = await Http.get(API_CONFIG.endpoints.config);
                if (configResponse.code === 1) {
                    this.config = configResponse.data;
                }
                
                // 获取投诉类型
                const typesResponse = await Http.get(API_CONFIG.endpoints.complaintTypes);
                if (typesResponse.code === 1) {
                    this.complaintTypes = typesResponse.data;
                }
                
                // 从URL获取企业和通道信息
                this.parseUrlParams();
                
            } catch (error) {
                this.showMessage('加载数据失败，请刷新页面重试', 'error');
            }
        },
        
        // 解析URL参数
        parseUrlParams() {
            const pathParts = window.location.pathname.split('/').filter(part => part);
            if (pathParts.length >= 2) {
                this.enterpriseId = pathParts[0];
                this.channelSn = pathParts[1];
            }
        },
        
        // 显示消息
        showMessage(text, type = 'info') {
            this.message = { text, type };
            setTimeout(() => {
                this.message = null;
            }, 5000);
        },
        
        // 触发文件选择
        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        
        // 处理文件选择
        handleFileSelect(event) {
            const files = Array.from(event.target.files);
            this.processFiles(files);
        },
        
        // 处理拖拽上传
        handleDrop(event) {
            this.dragover = false;
            const files = Array.from(event.dataTransfer.files);
            this.processFiles(files);
        },
        
        // 处理文件
        processFiles(files) {
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            
            if (imageFiles.length === 0) {
                this.showMessage('请选择图片文件', 'error');
                return;
            }
            
            const remainingSlots = this.maxImages - this.form.images.length;
            if (imageFiles.length > remainingSlots) {
                this.showMessage(`最多只能上传 ${this.maxImages} 张图片`, 'error');
                imageFiles.splice(remainingSlots);
            }
            
            imageFiles.forEach(file => {
                if (file.size > 5 * 1024 * 1024) {
                    this.showMessage(`图片 ${file.name} 超过 5MB 限制`, 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.form.images.push({
                        file: file,
                        preview: e.target.result
                    });
                };
                reader.readAsDataURL(file);
            });
        },
        
        // 移除图片
        removeImage(index) {
            this.form.images.splice(index, 1);
        },
        
        // 提交投诉
        async submitComplaint() {
            if (!this.isFormValid || this.submitting) return;
            
            this.submitting = true;
            
            try {
                // 先上传图片
                const imageUrls = await this.uploadImages();
                
                // 构建投诉数据
                const complaintData = {
                    enterprise_id: this.enterpriseId,
                    channel_sn: this.channelSn,
                    phone: this.form.phone,
                    type_id: this.form.type_id,
                    content: this.form.content,
                    images: imageUrls.join(',')
                };
                
                // 提交投诉
                const response = await Http.post(API_CONFIG.endpoints.complaint, complaintData);
                
                if (response.code === 1) {
                    this.complaintId = response.data.complaint_id;
                    this.submitted = true;
                    this.showMessage('投诉提交成功', 'success');
                } else {
                    this.showMessage(response.msg || '提交失败', 'error');
                }
                
            } catch (error) {
                this.showMessage('提交失败，请稍后重试', 'error');
            } finally {
                this.submitting = false;
            }
        },
        
        // 上传图片
        async uploadImages() {
            const imageUrls = [];
            
            for (const image of this.form.images) {
                const formData = new FormData();
                formData.append('image', image.file);
                
                try {
                    const response = await Http.upload(API_CONFIG.endpoints.upload, formData);
                    if (response.code === 1) {
                        imageUrls.push(response.data.url);
                    }
                } catch (error) {
                    console.error('图片上传失败:', error);
                }
            }
            
            return imageUrls;
        },
        
        // 查看投诉详情
        viewComplaint() {
            Router.push(`/complaint/${this.complaintId}`);
        },
        
        // 继续投诉
        submitAnother() {
            this.submitted = false;
            this.complaintId = '';
            this.form = {
                phone: '',
                type_id: '',
                content: '',
                images: []
            };
        }
    },
    
    async mounted() {
        await this.initData();
    }
};

// 导出组件
window.ComplaintForm = ComplaintForm;