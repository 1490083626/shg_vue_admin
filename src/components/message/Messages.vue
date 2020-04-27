<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>留言管理</el-breadcrumb-item>
      <el-breadcrumb-item>留言列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入商品ID"
            v-model="queryInfo.productId"
            clearable
            @clear="getCommentList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getCommentList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="commentList" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="留言内容" prop="comment"></el-table-column>
        <el-table-column label="留言者昵称" prop="nickname"></el-table-column>
        <!-- <el-table-column label="留言者ID" prop="fromUserId"></el-table-column> -->
        <el-table-column label="被留言者昵称" prop="toNickname"></el-table-column>
        <!-- <el-table-column label="被留言者ID" prop="toUserId"></el-table-column> -->
        <el-table-column label="留言商品ID" prop="productId"></el-table-column>
        <el-table-column label="创建时间" prop="createTime"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.enableStatus" @change="commentStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope" v-bind="scope.row.commentId">
            <!-- 修改 -->
            <!-- <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.commentId)"
            ></el-button> -->
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeCommentById(scope.row.commentId)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageIndex"
        :page-sizes="[2, 5, 10, 50]"
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
        productId: '',
        pageIndex: 1,
        pageSize: 10
      },
      commentList: [],
      total: 0
    }
  },
  created() {
    this.getCommentList()
  },
  methods: {
    async getCommentList() {
      const { data: res } = await this.$http.get('useradmin/getCommentList', {
        params: this.queryInfo
      })
      console.log('getCommentList:', res)
      if (!res.success) {
        return this.$message.error('获取留言列表失败')
      }
      for (const item of res.commentsList) {
        if (item.enableStatus === 1) {
          item.enableStatus = true
        } else {
          item.enableStatus = false
        }
      }
      // this.$message.success('获取用户列表成功')
      this.commentList = res.commentsList
      this.total = res.count
    },
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize
      this.getCommentList()
    },
    handleCurrentChange(current) {
      this.queryInfo.pageIndex = current
      this.getCommentList()
    },
    async commentStateChanged(row) {
      row.enableStatus = row.enableStatus ? 1 : 0
      const { data: res } = await this.$http.post('useradmin/upadteComment', {
        enableStatus: row.enableStatus,
        commentId: row.commentId
      })
      // console.log('update', res)
      if (!res.success) {
        row.enableStatus = !row.enableStatus
        return this.$message.error('修改状态失败')
      }
      row.enableStatus = !!row.enableStatus
      this.$message.success('更新状态成功')
    },
    async showEditDialog(commentId) {
      // 发送请求根据id获取留言信息
      const { data: res } = await this.$http.get(
        'auth/getWechatUserByOpenId?id=' + commentId
      )
      // 判断如果添加失败，就做提示
      if (!res.success) {
        return this.$message.error('获取用户信息失败')
      }
      // 将获取到的数据保存到数据editForm中
      console.log(res)
      this.editForm = res.data
      // 显示弹出窗
      this.editDialogVisible = true
    },
    async removeCommentById(commentId) {
      console.log('commentId', commentId)

      // 弹出确定取消框，是否删除用户
      const confirmResult = await this.$confirm(
        '请问是否要永久删除该留言',
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
      // 发送请求根据id完成删除操作
      const { data: res } = await this.$http.post(
        'useradmin/deleteComment?commentId=' + commentId
      )
      // 判断如果删除失败，就做提示
      if (!res.success) return this.$message.error('删除留言失败')
      // 修改成功的提示
      this.$message.success('删除留言成功')
      // 重新请求最新的数据
      this.getCommentList()
    }
  }
}
</script>
<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
</style>
