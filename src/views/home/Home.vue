<template>
  <div id="home">
    <nav-bar class="home-nav"><div slot="center">购物商城</div></nav-bar>
    <tab-control :titles="['流行','新款','精选']"
                 @tabClick="tabClick"
                 ref="tabControl1"
                 class="tab-control"
                 v-show="isTabFixed"/>
    <scroll class="content"
            ref="scroll"
            :probe-type="3"
            @scroll="contentScroll"
            :pull-up-load="true"
            @pullingUp="loadMore">
      <home-swiper :banners="banners" @swiperImageLoad="swiperImageLoad"/>
      <!--    把数据传进来，在RecommendView进行展示-->
      <recommend-view :recommends="recommends"/>
      <feature-view/>
      <tab-control :titles="['流行','新款','精选']"
                   @tabClick="tabClick"
                   ref="tabControl2"/>
      <goods-list :goods="showGoods"/>
    </scroll>
    <back-top @click.native="backClick" v-show="isShowBackUp"/>
  </div>
</template>

<script>

  import HomeSwiper from "./childComps/HomeSwiper";
  import RecommendView from "./childComps/RecommendView";
  import FeatureView from "./childComps/FeatureView";

  import NavBar from "components/common/navbar/NavBar";
  import TabControl from "components/content/tabControl/TabControl";
  import GoodsList from "components/content/goods/GoodsList";
  // import GoodsListItem from "components/content/goods/GoodsListItem";
  import Scroll from "components/common/scroll/Scroll";
  import BackTop from "components/content/backTop/BackTop";

  import {getHomeMultidata,getHomeGoods} from "network/home";
  import {debounce} from "common/utils";
  import {itemListenerMixin} from "common/mixin";


  export default {
    name: "Home",
    mixins:[itemListenerMixin],
    components: {
      // Swiper,
      // SwiperItem,
      HomeSwiper,
      RecommendView,
      FeatureView,
      NavBar,
      TabControl,
      GoodsList,
      // GoodsListItem
      Scroll,
      BackTop

    },
    data() {
      return {
        // result:null
        banners:[],
        recommends:[],
        goods:{
          'pop':{page:0,list:[]},
          'new':{page:0,list:[]},
          'sell':{page:0,list:[]}
        },
        currentType:'pop',
        isShowBackUp:false,
        tabOffsetTop:0,
        isTabFixed:false,
        saveY:0,
      }
    },
    computed:{
      showGoods(){
        return this.goods[this.currentType].list
      }
    },
    activated() {
      //scrollTo(x,y,时间)
      this.$refs.scroll.scrollTo(0,this.saveY)
      this.$refs.scroll.refresh()
    },
    deactivated() {
      //1.保存Y值
      this.saveY = this.$refs.scroll.getScrollY()
    //  2.取消全局事件的监听
      this.$bus.$off('itemImageLoad',this.itemImgListener)

    },
    created() {
      //一定用this才不会调用其他的
      this.getHomeMultidata(),
      //  2.请求商品数据
      this.getHomeGoods('pop')
      this.getHomeGoods('new')
      this.getHomeGoods('sell')

    },
    //使用了混入mixin，mounted中的代码省去
    mounted() {
      //1.监听item中图片加载完成,这个地方的img标签确实被挂载，但其中的图片还没有占据高度

      // let newRefresh = debounce(this.$refs.scroll.refresh)

      //对监听的事件进行保存
      // this.itemImgListener = () => {
      //   newRefresh(20,30,'abc')
      // }
      // this.$bus.$on('itemImageLoad',this.itemImgListener)

      // 2.获取tabControl的offsetTop
      //这时候的offsetTop高度不包括所有图片（可能还没加载完），所以高度比原来低
      // 所有组件都有$el，获取组件中的元素
      // this.tabOffsetTop = this.$refs.tabControl.$el.offsetTop
    },
    methods:{
      /*
      *事件监听相关方法
       */
      tabClick(index) {
        switch (index) {
          case 0:
            this.currentType = 'pop'
            break
          case 1:
            this.currentType = 'new'
            break
          case 2:
            this.currentType = 'sell'
            break
        }
        this.$refs.tabControl1.currentIndex = index
        this.$refs.tabControl2.currentIndex = index
      },
      backClick() {
        this.$refs.scroll.scrollTo(0,0,300)
      },
      contentScroll(position){
        // console.log(position)
        //1.判断BackTop是否显示，监听y轴
        this.isShowBackUp = -(position.y) > 1000
      //  2.决定tabControl是否吸顶（position：fixed）
        this.isTabFixed = -(position.y) >  this.tabOffsetTop

      },
      loadMore() {
        // console.log('shangla')
        this.getHomeGoods(this.currentType)
      },
      swiperImageLoad() {
        this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop
      },
      /*
      *网络请求相关方法
       */
      getHomeMultidata(){
        getHomeMultidata().then(res => {
          // this.result = res
          // console.log(res);
          this.banners = res.data.banner.list
          this.recommends = res.data.recommend.list
        })
      },
      getHomeGoods(type){
        const page = this.goods[type].page + 1
        getHomeGoods(type,page).then(res => {
          //res是拿到的第一页的前30条数据
          // console.log(res)
          //...相当于解构，把数组放到另一个数组中
          this.goods[type].list.push(...res.data.list)
          this.goods[type].page += 1
          //完成上拉加载更多
          this.$refs.scroll.finishPullUp()
        })
      }
    }
  }
</script>


<style scoped>
  #home {
    /*百分百的视口*/
    height: 100vh;
    position: relative;
  }

  .home-nav {
    background-color: var(--color-tint);
    color: #fff;
    /*在使用浏览器原生滚动时，为了让导航不跟随一起滚动*/
    /*position: fixed;*/
    /*left: 0;*/
    /*right: 0;*/
    /*top: 0;*/
    /*z-index: 9;*/
  }

  .tab-control {
    /*position: sticky;*/
    /*top: 44px;*/
    /*不会被覆盖 */
    z-index: 9;
    position: relative;

  }

  .content {
    /*height: 300px;*/
    overflow: hidden;
    position: absolute;
    top: 44px;
    bottom: 49px;
    left: 0;
    right: 0;
  }
  /*.content {*/
  /*  overflow: hidden;*/
  /*  margin-top: 44px;*/
  /*  height: calc(100% - 93px);*/
  /*}*/
</style>

