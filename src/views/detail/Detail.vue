<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="nav"/>
    <scroll class="content" ref="scroll" :probe-type = '3' @scroll="contentScroll">
      <detail-swiper :top-images="topImages"/>
      <detail-base-info :goods="goods"/>
      <detail-shop-info :shop="shop"/>
      <detail-goods-info :detail-info="detailInfo" @imgLoad = 'imgLoad' ref="goodsInfo"/>
      <detail-param-info ref="params" :param-info="paramInfo"/>
      <detail-comment-info ref="comment" :comment-info="commentInfo"/>
      <goods-list ref="recommend" :goods="recommends"/>
    </scroll>
    <detail-bottom-bar @addCart = 'addCart' @buyNow = 'buyNow'/>
    <back-top  @click.native = "backClick" v-show = 'isShowBackUp'></back-top>
<!--    <toast/>-->
  </div>
</template>

<script>
import DetailNavBar from "./childComps/DetailNavBar";
import DetailSwiper from "./childComps/DetailSwiper";
import DetailBaseInfo from "./childComps/DetailBaseInfo";
import DetailShopInfo from "./childComps/DetailShopInfo";
import DetailGoodsInfo from "./childComps/DetailGoodsInfo";
import DetailParamInfo from "./childComps/DetailParamInfo";
import DetailCommentInfo from "./childComps/DetailCommentInfo";
import DetailBottomBar from "./childComps/DetailBottomBar";

import Scroll from "components/common/scroll/Scroll";
import GoodsList from "components/content/goods/GoodsList";
// import Toast from "components/common/toast/Toast";

import {getDetail,Goods,Shop,GoodsParam,getRecommend} from "network/detail";
import {itemListenerMixin, backTopMixin} from "common/mixin";
import { mapActions } from "vuex";


export default {
  name: "Detail",
  mixins:[itemListenerMixin,backTopMixin],
  data() {
    return {
      iid:null,
      topImages:[],
      //goods默认不能为null
      goods: {},
      shop:{},
      detailInfo:{},
      paramInfo:{},
      commentInfo:{},
      recommends:[],
      //点击标题滚动到对应位置,保存offseTop的值
      themeTopYs: [],
    }
  },
  components:{
    DetailNavBar,
    DetailSwiper,
    DetailBaseInfo,
    DetailShopInfo,
    DetailGoodsInfo,
    DetailParamInfo,
    DetailCommentInfo,
    DetailBottomBar,
    Scroll,
    GoodsList,
    // Toast

  },
  created() {
    //1.保存传入的iid
    this.iid = this.$route.params.iid
    // console.log(this.$route.params.iid)
    //2.根据iid请求详情数据
    getDetail(this.iid).then(res => {
        // console.log(res)
        // 1.保存获取的数据
      const data = res.result
        // 2.获取顶部轮播图片数据
      this.topImages = data.itemInfo.topImages
        // 3.获取商品信息:将复杂的类整合到一起
      this.goods = new Goods(data.itemInfo, data.columns, data.shopInfo.services)
        // console.log(this.goods)
        // 4.获取店铺信息
      this.shop = new Shop(data.shopInfo)
        // 5.保存商品详情数据
      this.detailInfo = data.detailInfo
        // 6.保存参数信息
      this.paramInfo = new GoodsParam(data.itemParams.info, data.itemParams.rule)
        // 7.获取评论信息
      if(data.rate.cRate !== 0) {
        this.commentInfo = data.rate.list[0]
      }
    })
  //  3.请求推荐数据
    getRecommend().then(res => {
      this.recommends = res.data.list
    })
  },
  methods:{
    ...mapActions(['addCart']),
    imgLoad() {
      //防止界面滑动过程图片的卡顿
      this.$refs.scroll.refresh()
      //等图片全部加载完,获取正确的offsetTop,(0, 5532, 6334, 6550)
      this.themeTopYs = []
      this.themeTopYs.push(0);
      this.themeTopYs.push(this.$refs.params.$el.offsetTop);
      this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
      this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
      //Number.MAX_VALUEjs的一个常量，表示js可表示的最大值
      this.themeTopYs.push(Number.MAX_VALUE)
      // console.log(this.themeTopYs)
    },
    titleClick(index) {
      //详情页点击标题滚动到对应位置
      this.$refs.scroll.scrollTo(0, -this.themeTopYs[index], 500)
    },
    // 滚动内容显示对于标题,监听scroll的滚动
    contentScroll(position) {
      // 1.获取Y值
      const positionY = -position.y
      // 2.与themeTopY进行比对
      let length = this.themeTopYs.length;
      // for(let i =0; i < length; i++) {
      //   if(this.currentIndex !== i && ((i <length-1 && positionY >=  this.themeTopYs[i] && positionY < this.themeTopYs[i+1])
      //     || (i === length-1 && positionY >= this.themeTopYs[i]))){
      //     this.currentIndex = i;
      //     this.$refs.nav.currentIndex = this.currentIndex
          // console.log( this.currentIndex)
          // }
        // }
      //在有最大值Number.MAX_VALUE的情况下
      for(let i =0; i < length-1; i++) {
        if(this.currentIndex !== i && (positionY >=  this.themeTopYs[i] && positionY < this.themeTopYs[i+1])){
          this.currentIndex = i;
          this.$refs.nav.currentIndex = this.currentIndex
        }
      }
      // 3.判断backtop是否显示
      this.isShowBackUp = (- position.y) > this.$refs.goodsInfo.$el.offsetTop;
      },
    addCart() {
      // 1.获取购物车需要展示的信息
      const product = {}
      product.image = this.topImages[0];
      product.title = this.goods.title;
      product.desc = this.goods.desc;
      product.price = this.goods.realPrice;
      product.iid = this.iid;
      // 2.放入到购物车中（用vuex）
      if(product.iid){
        this.$store.dispatch('addCart',product).then(res => {
          this.$toast.show(res, 1500)
        })}else {
        this.$toast.show('添加失败请刷新重试', 1500)
      }
      // this.addCart(product).then(res => {
      //   console.log(res)
      // })
    },

    buyNow() {
      const product = {}
      product.image = this.topImages[0];
      product.title = this.goods.title;
      product.desc = this.goods.desc;
      product.price = this.goods.realPrice;
      product.iid = this.iid;
      // 放入到购物车中
      if(product.iid){
        this.$store.dispatch('buyNow',product).then(res => {
          this.$toast.show(res, 1500)
          this.$router.push('/cart')
        })}else {
        this.$toast.show('添加失败请刷新重试', 1500)
      }
    }
  },
  mounted() {
    this.$bus.$off('itemImageLoad',this.itemImgListener)
  }
}
</script>

<style scoped>
  #detail {
    position: relative;
    z-index: 9;
    background-color: #fff;
    height:100vh
  }
  .content {
    /*height: calc(100% - 44px);*/
    /*加入工具栏用相对定位需要减49，用fixed则不用减*/
    height: calc(100% - 44px - 49px);
  }
  .detail-nav {
    position: relative;
    z-index: 9;
    background-color: #fff;
  }
</style>
