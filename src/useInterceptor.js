import axios from 'axios'
import router from "@/router/index.js";

export default function () {
    // http request 拦截器
    axios.interceptors.request.use(
        config => {
            // 判断token是否存在
            if (localStorage.getItem('token')) {
                // 将token设置成请求头
                config.headers.token = localStorage.getItem('token');
            }
            return config;
        },
        err => {
            return Promise.reject(err);
        }
    );

    // http response 拦截器
    axios.interceptors.response.use(
        response => {
            return response;
        },
        error => {
            if (error.response.status == 401) {
                router.replace('/');
                console.log("登录过期");
            }
            return Promise.reject(error);
        }
    );
}
