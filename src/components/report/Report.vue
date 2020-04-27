<template>
  <div>
    <h3>数据报表</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <div id="main" style="width:750px;height:400px;"></div>
    </el-card>
  </div>
</template>
<script>
// 导入echarts
import echarts from 'echarts'
// 导入lodash
// import _ from 'lodash'
export default {
  data() {
    return {}
  },
  created() {},
  async mounted() {
    // 在页面dom元素加载完毕之后执行的钩子函数mounted
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    // 准备数据和配置项
    // 发送请求获数据
    const { data: res } = await this.$http.get('frontend/getProductCountByCate')

    if (!res.success) {
      return this.$message.error('获取数据失败')
    }
    console.log(res)

    // console.log(this.option.legend.data)
    console.log('res.nameData:', res.nameData)
    console.log('res.countData:', res.countData)

    const countData = res.countData
    const nameData = res.nameData

    const seriesData = []
    for (let i = 0; i < countData.length; i++) {
      const item = {}
      item.value = countData[i]
      item.name = nameData[i]
      seriesData.push(item)
    }
    console.log('seriesData', seriesData)

    const option = {
      title: {
        text: '二手商品分类统计',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: res.nameData
      },
      series: [
        {
          name: '访问来源',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: seriesData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }

    // this.option.legend.data = res.nameData
    // this.option.series.data = seriesData
    // 合并res.data和this.options
    // const result = _.merge(data, this.options)
    console.log('this.option', option)
    // 使用获取的数据展示图表
    myChart.setOption(option)
  },
  methods: {}
}
</script>

<style lang="less" scoped>
</style>
