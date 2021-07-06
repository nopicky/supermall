<template>
<!--  ref 表示明确的拿到某个子组件（div也可以），而chilidren是拿到所有组件-->
  <div class="wrapper" ref="wrapper">
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import BScroll from "better-scroll";
export default {
  name: "Scroll",
  props:{
    probeType: {
      type:Number,
      default:0
    },
    pullUpLoad:{
      type:Boolean,
      default: false
    }
  },
  data() {
    return {
      scroll:null
    }
  },
  components:{
    BScroll
  },
  mounted() {
    //1.创建BScroll对象
    this.scroll = new BScroll(this.$refs.wrapper,{
      click:true,
      probeType:this.probeType,
      pullUpLoad:this.pullUpLoad
    })
    //2.监听滚动位置
    this.scroll.on('scroll',(position) => {
      // console.log(position)
      //发送给Home使用
      this.$emit('scroll',position)
    })
    //3.监听上拉加载更多事件
    this.scroll.on('pullingUp',() => {
      // console.log('pullingUp')
      this.$emit('pullingUp')
    })
  },
  methods:{
    scrollTo(x,y,time=300) {
      this.scroll && this.scroll.scrollTo(x,y,time)
    },
    finishPullUp() {
      this.scroll && this.scroll.finishPullUp()
    },
    refresh() {
      // console.log('------测防抖')
      this.scroll && this.scroll.refresh()
    },
    getScrollY() {
      return this.scroll ? this.scroll.y : 0
    }
  }
}
</script>

<style scoped>

</style>
