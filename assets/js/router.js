// 简单的前端路由管理
const Router = {
    // 当前路由
    currentRoute: '/',
    
    // 路由规则
    routes: {
        '/': 'ComplaintForm',
        '/complaint/:id': 'ComplaintDetail',
        '/notice': 'ComplaintNotice'
    },
    
    // 初始化路由
    init() {
        this.handleRoute();
        window.addEventListener('popstate', () => this.handleRoute());
    },
    
    // 处理路由变化
    handleRoute() {
        const path = window.location.pathname;
        const component = this.matchRoute(path);
        
        if (component) {
            this.currentRoute = path;
            // 触发Vue组件更新
            if (window.app) {
                window.app.currentRoute = path;
                window.app.currentComponent = component;
                window.app.routeParams = this.extractParams(path);
            }
        }
    },
    
    // 匹配路由
    matchRoute(path) {
        // 直接匹配
        if (this.routes[path]) {
            return this.routes[path];
        }
        
        // 动态路由匹配
        for (const route in this.routes) {
            if (route.includes(':')) {
                const regex = this.routeToRegex(route);
                if (regex.test(path)) {
                    return this.routes[route];
                }
            }
        }
        
        return 'ComplaintForm'; // 默认组件
    },
    
    // 将路由转换为正则表达式
    routeToRegex(route) {
        const pattern = route.replace(/:\w+/g, '([^/]+)');
        return new RegExp('^' + pattern + '$');
    },
    
    // 提取路由参数
    extractParams(path) {
        const params = {};
        
        for (const route in this.routes) {
            if (route.includes(':')) {
                const regex = this.routeToRegex(route);
                const match = path.match(regex);
                
                if (match) {
                    const paramNames = route.match(/:(\w+)/g);
                    if (paramNames) {
                        paramNames.forEach((paramName, index) => {
                            const name = paramName.substring(1); // 移除 ':'
                            params[name] = match[index + 1];
                        });
                    }
                    break;
                }
            }
        }
        
        return params;
    },
    
    // 导航到指定路由
    push(path) {
        if (path !== this.currentRoute) {
            window.history.pushState(null, '', path);
            this.handleRoute();
        }
    },
    
    // 替换当前路由
    replace(path) {
        window.history.replaceState(null, '', path);
        this.handleRoute();
    },
    
    // 后退
    back() {
        window.history.back();
    }
};

// 导出到全局
window.Router = Router;