import { createRouter, createWebHashHistory } from 'vue-router'
// 还有 createWebHashHistory 和 createMemoryHistory

const routes = [
  {
    path: '/',
    name: 'UserLogin',
    component: () => import('../views/login/UserLogin.vue') // 建议进行路由懒加载，优化访问性能
  },
  {
    path: '/adminLogin',
    name: 'AdminLogin',
    component: () => import('../views/login/AdminLogin.vue')
  },
  {
    path: '/binding',
    name: 'Binding',
    component: () => import('../views/login/Binding.vue')
  },
  {
    path: '/index',
    name: 'Index',
    component: () => import('../views/usermain/Index.vue'),
    children: [
      {
        path:'noteList',
        name:"NoteList",
        component: ()=> import("../views/usermain/note/Note.vue"),
      },
      {
        path:'userGroup',
        name:"UserGroup",
        component: ()=> import("../views/usermain/userGroup/UserGroup.vue"),
        children:[
          {
            path: ':id?',
            name: 'Member',
            props: true,
            component: () => import('../views/usermain/userGroup/Member.vue')
          }
        ]
      },
      {
        path:'user',
        name:"User",
        component: ()=> import("../views/usermain/user/User.vue"),
      }
    ]
  },
  {
    path: "/admin",
    name: 'Admin',
    component: () => import('../views/admin/Admin.vue'),
    children: [
      {
        path: 'user',
        name: 'UserManagement',
        component: () => import('../views/admin/userManagement/UserManagement.vue'),
      },
      {
        path: 'rootCerts',
        name: 'RootCerts',
        component: () => import('../views/admin/rootCerts/certsManagement.vue'),
      }
      ,{
        path: 'note',
        name: 'AdminNote',
        component: () => import('../views/admin/note/Note.vue'),
      }
    ]
  },
  {
    path: "/audit",
    name: "Audit",
    component: () => import('../views/audit/Audit.vue'),
    children: [{
      path: "operationLog",
      name: "OperationLog",
      component: () => import('../views/audit/operationLog/operationLog.vue')
    },
    {
      path: "programLog",
      name: "ProgramLog",
      component: () => import('../views/audit/programLog/programLog.vue')
    }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
