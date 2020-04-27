<template>
  <div>
    <h3>商品列表</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.productName">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList('search')"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="productName" min-width="140px"></el-table-column>
        <el-table-column label="图片" prop="imgAddr" min-width="124px">
          <template slot-scope="scope">
            <img class="product-img" :src="baseUrl + scope.row.imgAddr" alt="商品缩略图" />
          </template>
        </el-table-column>
        <el-table-column label="发布人" prop="owner.nickname" min-width="140px"></el-table-column>
        <el-table-column label="商品现价(元)" prop="promotionPrice" width="95px"></el-table-column>
        <el-table-column label="商品原价(元)" prop="normalPrice" width="95px"></el-table-column>
        <el-table-column label="商品描述" prop="productDesc" width="200px"></el-table-column>
        <el-table-column label="商品分类" prop="productCategory.productCategoryName" width="90px"></el-table-column>
        <el-table-column label="商品区域" prop="area.areaName" width="90px"></el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="140px"></el-table-column>
        <el-table-column label="修改时间" prop="lastEditTime" width="140px"></el-table-column>
        <el-table-column label="联系人" prop="linkman" width="90px"></el-table-column>
        <el-table-column label="联系人电话" prop="contactPhone" width="140px"></el-table-column>
        <el-table-column label="联系人微信" prop="contactWechat" width="140px"></el-table-column>
        <el-table-column label="上架">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.enableStatus" @change="productStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <!-- <el-table-column label="创建时间" prop="createTime" width="140px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>-->
        <el-table-column label="操作" width="125px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="modifyGoods(scope.row.productId)"
            ></el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeGoods(scope.row.productId)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageIndex"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      queryInfo: {
        productName: '',
        pageIndex: 1,
        pageSize: 10
      },
      goodsList: [],
      total: 0,
      baseUrl: 'http://120.25.235.30/'
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList(type) {
      // 如果是搜索时调用，设页码为1，避免翻页后的bug
      if (type === 'search') {
        this.queryInfo.pageIndex = 1
      }
      console.log(this.queryInfo)
      const { data: res } = await this.$http.get('useradmin/getproductlist', {
        params: this.queryInfo
      })
      if (!res.success) {
        return this.$message.error('获取商品列表失败')
      }
      console.log(res)
      for (const item of res.productList) {
        if (item.enableStatus === 1) {
          item.enableStatus = true
        } else {
          item.enableStatus = false
        }
      }
      console.log(res.productList)
      this.$message.success('获取商品列表成功')
      this.goodsList = res.productList
      this.total = res.count
    },
    handleSizeChange(newSize) {
      // 当页号发生改变时，更改pageSize，重新请求
      this.queryInfo.pageSize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      // 当页码发生改变时，更改pageSize，重新请求
      this.queryInfo.pageIndex = newPage
      this.getGoodsList()
    },
    async productStateChanged(row) {
      console.log(row.productId)
      row.enableStatus = row.enableStatus ? 1 : 0
      const { data: res } = await this.$http.post(
        'useradmin/updateProductEnableStatus?productId=' + row.productId
      )
      console.log('update', res)
      if (!res.success) {
        row.enableStatus = !row.enableStatus
        return this.$message.error('修改状态失败')
      }
      row.enableStatus = !!row.enableStatus
      this.$message.success('更新状态成功')
    },
    async removeGoods(productId) {
      const confirmResult = await this.$confirm(
        '请问是否要删除该商品',
        '删除提示',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }

      // 没有取消就是要删除，发送请求完成删除
      const { data: res } = await this.$http.post(
        `useradmin/updateProductEnableStatus?productId=${productId}&deleteProduct=true`
      )
      if (!res.success) {
        return this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getGoodsList()
    },
    modifyGoods(productId) {
      console.log(productId)
      sessionStorage.setItem('type', 'modify')
      this.$router.push({
        path: '/goods/add',
        query: { productId: productId }
      })
      console.log('this.$route.params:', this.$route)
    },
    goAddPage() {
      sessionStorage.setItem('type', 'add')
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
.product-img {
  width: 100px;
  height: 100px;
}
</style>
