<template>
  <div class="goods">
    <goods-list-item v-for="item in goods" :goods-item="item"/>
  </div>
</template>

<script>
import GoodsListItem from "./GoodsListItem";
export default {
  name: "GoodsList",
  components:{
    GoodsListItem
  },
  props:{
    goods:{//注意这里的goods跟上面对应
      type:Array,
      default() {
        return []
      }
    }
  }
}
</script>

<style scoped>
  .goods {
    display: flex;
    /*会根据宽度看一行显示多少个，nowrap则显示在一行*/
    flex-wrap: wrap;
    /*一行均等分*/
    justify-content: space-around;
    padding: 2px;
  }
</style>
