// API 配置
const API_BASE_URL = 'http://b3v.cn/api'; // 替换为您的后端 API 地址

// 工具函数
function getUrlQuery(name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    }
    return null;
}

function isValidMobileNumber(phoneNumber) {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phoneNumber);
}

(function(){
    window.alert = function(name){
        var iframe = document.createElement("IFRAME");
        iframe.style.display="none";
        iframe.setAttribute("src", 'data:text/plain');
        document.documentElement.appendChild(iframe);
        window.frames[0].window.alert(name);
        iframe.parentNode.removeChild(iframe);
    }
})();

// 投诉页面组件
const ComplaintPage = {
    template: `
        <div>
            <div v-if="!submitSuccess">
                <div v-if="hasChildTypes || currentTid === 0">
                    <div class="x-title" style="padding-top: 16px; padding-bottom: 4px; padding-left: 16px; padding-right: 16px; color: rgba(0,0,0,.5); font-size: 14px; line-height: 1.4; background-color:#ECECEC">
                        请选择投诉该账号的原因：
                    </div>
                    <div class="weui-cells">
                        <a href="javascript:" class="weui-cell weui-cell_access" v-for="item in list" :key="item.tid" @click="change(item)">
                            <div class="weui-cell__bd">
                                <p>{{item.text}}</p>
                            </div>
                            <div class="weui-cell__ft"></div>
                        </a>
                    </div>
                    <div class="btnknow" style="font-size: 15px; color: #51628B; text-align: center; margin-top: 20px;" @click="goKnow">投诉须知</div>
                </div>
                
                <div class="weui-form" v-else style="padding:0px">
                    <div class="weui-form__control-area" style="margin:24px 0px">
                        <div class="weui-cells__group weui-cells__group_form">
                            <div class="weui-cells weui-cells_form">
                                <div class="weui-cell weui-cell_active">
                                    <div class="weui-cell__hd">
                                        <label class="weui-label">
                                            手机号码 <span style="color:red">*</span>
                                        </label>
                                    </div>
                                    <div class="weui-cell__bd">
                                        <input placeholder="填写您的手机号码" class="weui-input" v-model="phone">
                                    </div>
                                    <div>
                                        <span v-if="!valid" style="color:rgb(244,127,143)">手机号码不正确</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="weui-cells__group weui-cells__group_form">
                            <div class="weui-cell weui-cell_uploader">
                                <div class="weui-cell__bd">
                                    <div class="weui-uploader">
                                        <div class="weui-uploader__hd">
                                            <p class="weui-uploader__title">图片上传</p>
                                            <div class="weui-uploader__info">{{upload_files.length}}/9</div>
                                        </div>
                                        <div class="weui-uploader__bd">
                                            <ul class="weui-uploader__files" id="uploaderFiles">
                                                <li class="weui-uploader__file" :style="'background-image:url('+pic+')'" v-for="pic in upload_files" :key="pic"></li>
                                            </ul>
                                            <div class="weui-uploader__input-box">
                                                <input id="uploaderInput" class="weui-uploader__input" type="file" accept="image/*" multiple @change="toUpload"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="weui-cells__group weui-cells__group_form">
                            <div class="weui-cells__title">
                                投诉内容 <span style="color:red">*</span>
                            </div>
                            <div class="weui-cells weui-cells_form">
                                <div class="weui-cell">
                                    <div class="weui-cell__bd">
                                        <textarea placeholder="请描述你所发生的问题" rows="3" class="weui-textarea" v-model="content"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="weui-form__opr-area">
                        <a href="javascript:" class="weui-btn weui-btn_primary" @click="submit">
                            提交
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="page" v-else>
                <div class="weui-msg">
                    <div class="weui-msg__icon-area"><i class="weui-icon-success weui-icon_msg"></i></div>
                    <div class="weui-msg__text-area">
                        <h2 class="weui-msg__title">投诉已提交</h2>
                        <p class="weui-msg__desc">您的投诉内容已提交处理，我们会尽快核实，并通知您审核结果。感谢您的支持</p>
                    </div>
                    <div class="weui-msg__opr-area">
                        <p class="weui-btn-area">
                            <a href="javascript:alert('确认要关闭当前页面吗?');window.location.href='about:blank';window.close();wx.closeWindow()" class="weui-btn weui-btn_primary">关闭</a>
                        </p>
                    </div>
                    <div class="weui-msg__tips-area"></div>
                    <div class="weui-msg__extra-area">
                        <div class="weui-footer"></div>
                    </div>
                </div>
            </div>
            
            <!-- 底部说明文字 -->
            <div class="bottom-notice" style="position: fixed; bottom: 0; left: 0; right: 0; background-color: #f5f5f5; padding: 15px 20px; text-align: center; font-size: 11px; color: #ddd; line-height: 1.4; max-width: 600px; margin: 0 auto;">
                为保障您的合法权益与服务质量，本次投诉内容将提交给本企业管理员安排专属顾问联系您处理，请知悉!
            </div>
        </div>
    `,
    data() {
        return {
            currentTid: 0,
            submitSuccess: false,
            upload_files: [],
            phone: "",
            content: "",
            type: "",
            sn: "",
            enterpriseId: "",
            time: "",
            valid: true,
            allList: [],
        }
    },
    computed: {
        list() {
            return this.allList.filter((item) => {
                return item.pid === this.currentTid
            })
        },
        hasChildTypes() {
            return this.allList.some((item) => {
                return item.pid === this.currentTid
            })
        }
    },
    mounted() {
        this.enterpriseId = this.$route.params.enterpriseId;
        this.sn = this.$route.params.channelSn;
        this.time = new Date().getTime();
        this.loadComplaintTypes();
        this.check();
    },
    methods: {
        goKnow() {
            this.$router.push({
                name: 'notice',
                params: {
                    enterpriseId: this.enterpriseId,
                    channelSn: this.sn
                }
            });
        },
        loadComplaintTypes() {
            const that = this;
            $.ajax({
                type: "GET",
                url: API_BASE_URL + "/get_complaint_types.php",
                data: {
                    sn: this.sn
                },
                dataType: 'json',
                xhrFields: {
                    withCredentials: false
                },
                success: function(data) {
                    console.log('投诉类型 API 返回:', data);
                    const res = typeof data === 'string' ? JSON.parse(data) : data;
                    if (res.code === 1 && res.data && res.data.types && res.data.types.length > 0) {
                        that.allList = res.data.types;
                        console.log('加载投诉类型成功:', that.allList);
                    } else {
                        console.error('加载投诉类型失败:', res.msg || '无数据');
                        // 使用默认类型
                        that.allList = [
                            {tid: 1, pid: 0, text: '服务问题'},
                            {tid: 2, pid: 0, text: '产品问题'},
                            {tid: 3, pid: 0, text: '其他问题'}
                        ];
                    }
                },
                error: function(xhr, status, error) {
                    console.error('加载投诉类型失败 - 网络错误:', error);
                    console.error('响应状态:', xhr.status);
                    console.error('响应内容:', xhr.responseText);
                    // 使用默认类型
                    that.allList = [
                        {tid: 1, pid: 0, text: '服务问题'},
                        {tid: 2, pid: 0, text: '产品问题'},
                        {tid: 3, pid: 0, text: '其他问题'}
                    ];
                }
            });
        },
        check() {
            $.ajax({
                type: "POST",
                url: API_BASE_URL + "/complain.php",
                data: {
                    type: "check",
                    sn: this.sn,
                    time: this.time,
                },
                success(data) {
                    const res = typeof data === 'string' ? JSON.parse(data) : data;
                    if(res.code != 1) {
                        if(res.data != "") {
                            window.location = res.data;
                        }
                    }
                }
            })
        },
        toUpload(e) {
            const that = this;
            const files = e.target.files;
            
            if (files.length === 0) {
                return;
            }
            
            console.log('开始上传图片，文件数量:', files.length);
            
            for (let i = 0, len = files.length; i < len; ++i) {
                if(this.upload_files.length >= 9) {
                    alert('最多只能上传 9 张图片');
                    break;
                }
                
                const file = files[i];
                
                // 验证文件类型
                if (!file.type.match('image.*')) {
                    alert('请上传图片文件');
                    continue;
                }
                
                // 验证文件大小 (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('图片大小不能超过 5MB');
                    continue;
                }
                
                console.log('上传图片:', file.name, '大小:', (file.size / 1024).toFixed(2) + 'KB');
                
                const formData = new FormData();
                formData.append('img', file);
                
                $.ajax({
                    type: "POST",
                    url: API_BASE_URL + "/upload_img.php",
                    data: formData,
                    contentType: false,
                    processData: false,
                    dataType: 'json',
                    xhrFields: {
                        withCredentials: false
                    },
                    success: function(data) {
                        console.log('图片上传响应:', data);
                        const res = typeof data === 'string' ? JSON.parse(data) : data;
                        if(res.code === 1 && res.data && res.data.url) {
                            // 添加完整的 URL前缀
                            const imageUrl = res.data.url.startsWith('http') ? res.data.url : (API_BASE_URL.replace('/api', '') + res.data.url);
                            that.upload_files.push(imageUrl);
                            console.log('图片上传成功:', imageUrl);
                        } else {
                            console.error('图片上传失败:', res.msg || '未知错误');
                            alert('图片上传失败：' + (res.msg || '请重试'));
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('图片上传失败 - 网络错误:', error);
                        console.error('响应状态:', xhr.status);
                        console.error('响应内容:', xhr.responseText);
                        alert('图片上传失败，请检查网络连接');
                    }
                });
            }
        },
        submit() {
            if (!this.phone) {
                alert("请填写手机号码")
                return
            }
            if (!this.content) {
                alert("请填写投诉内容")
                return
            }
            if(!isValidMobileNumber(this.phone)) {
                this.valid = false;
                alert("请填写有效的手机号码")
                return
            } else {
                this.valid = true;
            }
            const that = this;
            $.ajax({
                type: "POST",
                url: API_BASE_URL + "/upload.php",
                data: {
                    type: "upload",
                    phone: that.phone,
                    content: that.content,
                    pic: that.upload_files,
                    complain: that.type,
                    sn: that.sn,
                    enterprise_id: that.enterpriseId
                },
                success: function(data) {
                    const res = typeof data === 'string' ? JSON.parse(data) : data;
                    if(res.code === 1) {
                        that.submitSuccess = true;
                    } else {
                        alert(res.msg || '提交失败，请重试');
                    }
                },
                error: function() {
                    alert('网络错误，请重试');
                }
            })
        },
        change(item) {
            const hasChildren = this.allList.some(child => child.pid === item.tid);
            
            if (hasChildren) {
                this.currentTid = item.tid;
            } else {
                this.currentTid = item.tid;
                this.type = item.text;
            }
        }
    }
};

// 投诉须知页面组件
const NoticePage = {
    template: `
        <div>
            <div class="weui-msg">
                <div class="weui-msg__text-area">
                    <h2 class="weui-msg__title">投诉须知</h2>
                    <p class="weui-msg__desc" style="text-align: left; padding: 20px;">
                        1. 请确保您填写的信息真实有效<br><br>
                        2. 我们将在收到投诉后的3个工作日内与您联系<br><br>
                        3. 请保持手机畅通，以便我们及时联系您<br><br>
                        4. 您的个人信息我们将严格保密<br><br>
                        5. 感谢您的支持与配合
                    </p>
                </div>
                <div class="weui-msg__opr-area">
                    <p class="weui-btn-area">
                        <a href="javascript:" class="weui-btn weui-btn_primary" @click="goBack">返回</a>
                    </p>
                </div>
            </div>
        </div>
    `,
    methods: {
        goBack() {
            this.$router.back();
        }
    }
};

// 路由配置
const routes = [
    {
        path: '/complaint/:enterpriseId/:channelSn',
        name: 'complaint',
        component: ComplaintPage
    },
    {
        path: '/complaint/:enterpriseId/:channelSn/notice',
        name: 'notice',
        component: NoticePage
    },
    {
        path: '/',
        redirect: '/complaint/demo/demo'
    }
];

const router = new VueRouter({
    mode: 'hash',
    base: '/nanchen.github.io/', // 根据您的仓库名修改
    routes
});

// 微信JS-SDK配置
wx.config({
    debug: false,
    appId: "",
    timestamp: "",
    nonceStr: "",
    signature: "",
    jsApiList: []
});

wx.ready(function(){
    
});

wx.error(function(res){
    
});

// Vue 应用
new Vue({
    el: '#app',
    router,
    data: {
        loading: false,
        error: null
    }
});
