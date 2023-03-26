import axios from "axios"

axios.interceptors.request.use(
    config => {
        // 每次发送请求之前判断vuex中是否存在token
        // 如果存在，则统一在http请求的header都加上token，这样后台根据token判断你的登录情况
        // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断
        config.headers['token'] = sessionStorage.getItem('Login-Token') // 让每个请求携带自定义token 请根据实际情况自行修改
        return config;
    },
    error => {
        return Promise.error(error);
    }
);

export default axios;