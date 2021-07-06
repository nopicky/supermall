import Vue from 'vue'
import App from './App.vue'
import router from "./router";
import store from "./store";
import VueLazyLoad from "vue-lazyload";
//默认导入index文件
import toast from "components/common/toast"
Vue.config.productionTip = false
//添加事件总线对象
Vue.prototype.$bus = new Vue()
//将会执行toast里面obj对象的函数
Vue.use(toast)

//使用懒加载的插件
Vue.use(VueLazyLoad, {
  loading:require('./assets/img/common/placehoder.png')
})
new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')

