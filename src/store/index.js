import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

export default createStore({
    state: {
        version: "",// 系统版本号
        userInfo: { // 登录的用户信息
            id: "",
            avatar: "",
            username: "",
            name: "",
            type: "",
            noteTags:"",
	        groupTags:"",
            imgSrc:"",
        },
    },
    mutations: {
        saveVersion(state, version) {
            state.version = version;
        },
        saveUserInfo(state, userInfo) {
            state.userInfo = userInfo;
        },
        saveAvatar(state, avatar) {
            state.userInfo.avatar = avatar
        },
        saveImgSrc(state, imgSrc) {
            state.userInfo.imgSrc = imgSrc
        },
        saveNoteTags(state,tags){
            state.userInfo.noteTags = tags
        }

       
    },
    getters: {
        getVersion(state) {
            return state.version
        },
        getUserInfo(state) {
            return state.userInfo
        },
    },
    plugins: [
        createPersistedState({
            // 存储方式：localStorage、sessionStorage、cookies
            storage: window.localStorage,
            // 存储的 key 的key值
            key: "store",
            render(state) {
                // 要存储的数据：本项目采用es6扩展运算符的方式存储了state中所有的数据
                return { ...state };
            }
        })
    ]
})




