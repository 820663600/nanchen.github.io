<?php
require_once __DIR__ . '/../../database/Database.php';

// 验证通道
try {
    $db = Database::getInstance();
    $channel = $db->fetchOne(
        "SELECT c.*, e.status as enterprise_status, e.expire_time 
         FROM channels c 
         LEFT JOIN enterprises e ON c.enterprise_id = e.enterprise_id 
         WHERE c.channel_sn = ? AND c.status = 'active'",
        [$channelSn]
    );
    
    if (!$channel || $channel['enterprise_status'] !== 'active') {
        http_response_code(404);
        echo '页面不存在';
        exit;
    }
    
    // 获取企业的投诉类型
    $complaintTypes = $db->fetchAll(
        "SELECT * FROM complaint_types 
         WHERE enterprise_id = ? AND status = 'active'
         ORDER BY parent_id ASC, sort_order ASC, created_at ASC",
        [$channel['enterprise_id']]
    );
    
    // 组织成前端需要的数据结构
    $frontendTypes = [];
    $parentTypes = [];
    $childTypes = [];
    $tidCounter = 1;
    
    // 首先处理一级分类
    foreach ($complaintTypes as $type) {
        if ($type['parent_id'] == 0) {
            $frontendTypes[] = [
                'tid' => $tidCounter,
                'pid' => 0,
                'text' => $type['name'],
                'db_id' => $type['id']
            ];
            $parentTypes[$type['id']] = $tidCounter;
            $tidCounter++;
        }
    }
    
    // 然后处理二级分类
    foreach ($complaintTypes as $type) {
        if ($type['parent_id'] != 0 && isset($parentTypes[$type['parent_id']])) {
            $frontendTypes[] = [
                'tid' => $tidCounter,
                'pid' => $parentTypes[$type['parent_id']],
                'text' => $type['name'],
                'db_id' => $type['id'],
                'parent_db_id' => $type['parent_id']
            ];
            $tidCounter++;
        }
    }
    
    // 如果企业没有设置投诉类型，使用默认类型
    if (empty($frontendTypes)) {
        $frontendTypes = [
            ['tid' => 1, 'pid' => 0, 'text' => '服务问题'],
            ['tid' => 2, 'pid' => 0, 'text' => '产品问题'],
            ['tid' => 3, 'pid' => 0, 'text' => '其他问题']
        ];
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo '系统错误';
    exit;
}
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <title>投诉</title>
    <link rel="stylesheet" href="https://res.wx.qq.com/open/libs/weui/2.4.4/weui.min.css">
    <style>
        [v-cloak]{
            display:none;
        }
        .btnknow {
            font-size: 15px;
            color: #51628B;
            text-align: center;
            margin-top: 20px;
        }
        body{
            max-width: 600px;
            margin:auto;
            background-color: #f5f5f5;
            padding-bottom: 80px;
        }
        
        .x-title{
            padding-top: 16px;
            padding-bottom: 4px;
            padding-left: 16px;
            padding-right: 16px;
            color: rgba(0,0,0,.5);
            color: var(--weui-FG-1);
            font-size: 14px;
            line-height: 1.4;
            background-color:#ECECEC
        }
                
        .bottom-notice {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #f5f5f5;
            padding: 15px 20px;
            text-align: center;
            font-size: 11px;
            color: #ddd;
            line-height: 1.4;
            max-width: 600px;
            margin: 0 auto;
        }
    </style>
</head>
<body data-weui-theme="light">
    <div id="app" v-cloak>
        <div v-if="!submitSuccess">
            <div v-if="hasChildTypes || currentTid === 0">
                <div class="x-title">
                    请选择投诉该账号的原因：
                </div>
                <div class="weui-cells">
                    <a href="javascript:" class="weui-cell weui-cell_access" v-for="item in allList" v-if="currentTid == item.pid" @click="change(item)">
                        <div class="weui-cell__bd">
                            <p>{{item.text}}</p>
                        </div>
                        <div class="weui-cell__ft">
                        </div>
                    </a>
                </div>
                <div class="btnknow" onclick="go_know()">投诉须知</div>
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
                                            <li class="weui-uploader__file" :style="'background-image:url('+pic+')'" v-for="pic in upload_files"></li>
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
        <div class="bottom-notice">
            为保障您的合法权益与服务质量，本次投诉内容将提交给本企业管理员安排专属顾问联系您处理，请知悉!
        </div>
    </div>
    
    <script src="/assets/js/vue.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
    <script src="https://res2.wx.qq.com/open/js/jweixin-1.6.0.js"></script>
    <script>
        function go_know(){
            // 跳转到投诉须知页面
            var currentUrl = window.location.pathname;
            var noticeUrl = currentUrl + '/notice';
            window.location.href = noticeUrl;
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
        
        function getUrlQuery(name) {
            let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            let r = window.location.search.substr(1).match(reg);
            if (r != null) {
                return decodeURIComponent(r[2]);
            }
            return null;
        }
        
        // 微信JS-SDK配置
        wx.config({
            debug: false,
            appId: "",
            timestamp: "",
            nonceStr: "",
            signature: "",
            jsApiList: []
        })
        wx.ready(function(){
            
        });
        wx.error(function(res){
            
        });
    </script>
    <script>
        var app = new Vue({
            el: "#app",
            data: {
                currentTid: 0,
                submitSuccess: false,
                upload_files: [],
                phone: "",
                content: "",
                type: "",
                sn: "<?php echo htmlspecialchars($channelSn); ?>",
                time: "",
                valid: true,
                allList: <?php echo json_encode($frontendTypes, JSON_UNESCAPED_UNICODE); ?>,
            },
            mounted() {
                this.time = new Date().getTime();
                this.loadComplaintTypes();
            },
            computed: {
                list: function() {
                    return this.allList.filter((item) => {
                        return item.pid === this.currentTid
                    })
                },
                // 检查当前选中的投诉类型是否有子分类
                hasChildTypes: function() {
                    return this.allList.some((item) => {
                        return item.pid === this.currentTid
                    })
                }
            },
            methods: {
                // 加载投诉类型
                loadComplaintTypes() {
                    var that = this;
                    $.ajax({
                        type: "GET",
                        url: "/api/get_complaint_types.php",
                        data: {
                            sn: this.sn
                        },
                        success: function(data) {
                            var res = typeof data === 'string' ? JSON.parse(data) : data;
                            if (res.code === 1) {
                                that.allList = res.data.types;
                                that.check();
                            } else {
                                console.error('加载投诉类型失败:', res.msg);
                                // 使用默认类型
                                that.check();
                            }
                        },
                        error: function() {
                            console.error('加载投诉类型失败: 网络错误');
                            // 使用默认类型
                            that.check();
                        }
                    });
                },
                check(){
                    $.ajax({
                        type:"POST",
                        url:"/api/complain.php",
                        data:{
                            type:"check",
                            sn:this.sn,
                            time: this.time,
                        },
                        success(data){
                            var data = JSON.parse(data);
                            if(data.code != 1){
                                if(data.data != ""){
                                    window.location = data.data;
                                } else {
                                    // window.location = "../404.html";
                                }
                            }
                        }
                    })
                },
                toUpload(e) {
                    var that = this;
                    var src, url = window.URL || window.webkitURL || window.mozURL, files = e.target.files;
                    for (var i = 0, len = files.length; i < len; ++i) {
                        if(this.upload_files.length < 9){
                            var file = files[i];
                            var formData = new FormData();
                            formData.append('img', file);
                            $.ajax({
                                type:"POST",
                                url:"/api/upload_img.php",
                                data:formData,
                                contentType: false,
                                processData: false,
                                success:function(data){
                                    var res = typeof data === 'string' ? JSON.parse(data) : data;
                                    if(res.code === 1 && res.data.url){
                                        that.upload_files.push(res.data.url);
                                    }
                                },
                                error:function(){
                                    alert('图片上传失败');
                                }
                            })
                        }
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
                    if(!isValidMobileNumber(this.phone)){
                        this.valid = false;
                        alert("请填写有效的手机号码")
                        return
                    } else {
                        this.valid = true;
                    }
                    var that = this;
                    $.ajax({
                        type:"POST",
                        url:"/api/upload.php",
                        data:{
                            type:"upload",
                            phone:that.phone,
                            content:that.content,
                            pic:that.upload_files,
                            complain:that.type,
                            sn:that.sn,
                            enterprise_id: "<?php echo htmlspecialchars($channel['enterprise_id']); ?>"
                        },
                        success:function(data){
                            var res = typeof data === 'string' ? JSON.parse(data) : data;
                            if(res.code === 1){
                                that.submitSuccess = true;
                            } else {
                                alert(res.msg || '提交失败，请重试');
                            }
                        },
                        error:function(){
                            alert('网络错误，请重试');
                        }
                    })
                },
                change(item){
                    // 检查这个投诉类型是否有子分类
                    const hasChildren = this.allList.some(child => child.pid === item.tid);
                    
                    if (hasChildren) {
                        // 如果有子分类，进入下一级选择
                        this.currentTid = item.tid;
                    } else {
                        // 如果没有子分类，直接设置类型并进入提交页面
                        this.currentTid = item.tid;
                        this.type = item.text;
                    }
                }
            }
        });
        
        function isValidMobileNumber(phoneNumber) {
            const regex = /^1[3-9]\d{9}$/;
            return regex.test(phoneNumber);
        }
    </script>
</body>
</html>