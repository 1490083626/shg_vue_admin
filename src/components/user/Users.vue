<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <!-- <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>-->
      </el-row>
      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="昵称" prop="nickname"></el-table-column>
        <el-table-column label="头像" prop="avatarUrl">
          <template slot-scope="scope">
            <img class="hp" :src="scope.row.avatarUrl" alt="hp" />
          </template>
        </el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="性别" prop="gender"></el-table-column>
        <!-- <el-table-column label="openId" prop="openId"></el-table-column> -->
        <el-table-column label="创建时间" prop="createdAt"></el-table-column>
        <el-table-column label="更新时间" prop="updatedAt"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.enableStatus" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope" v-bind="scope.row.id">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.openId)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed"></el-dialog>
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 对话框主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="头像" prop="avatarUrl">
          <el-input v-model="editForm.avatarUrl"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="editForm.gender">
            <el-radio :label="2">女</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">未知</el-radio>
          </el-radio-group>
          <!-- <el-input v-model="editForm.gender"></el-input> -->
        </el-form-item>
        <!-- <el-form-item label="openId" prop="openId">
          <el-input v-model="editForm.openId"></el-input>
        </el-form-item> -->
        <el-form-item label="创建时间" prop="createdAt">
          <el-input v-model="editForm.createdAt" disabled></el-input>
        </el-form-item>
        <el-form-item label="更新时间" prop="updatedAt">
          <el-input v-model="editForm.updatedAt" disabled></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 验证手机号码的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      // 返回一个错误提示
      cb(new Error('请输入合法的手机号码'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      userList: [],
      total: 0,
      // 是否显示添加用户弹出窗
      addDialogVisible: false,
      // addForm: {
      //   username: '',
      //   password: '',
      //   mobile: ''
      // },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          {
            validator: checkMobile,
            message: '手机号码不正确，请重新输入',
            trigger: 'blur'
          }
        ]
      },
      // 控制修改用户对话框的显示与否
      editDialogVisible: false,
      editForm: {
        nickname: '',
        avatarUrl: '',
        mobile: '',
        gender: '',
        openId: ''
      },
      // 修改表单的验证规则对象
      editFormRules: {
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          {
            min: 1,
            max: 10,
            message: '用户名在1~10个字符之间',
            trigger: 'blur'
          }
        ],
        avatarUrl: [
          { required: true, message: '请输入头像地址', trigger: 'blur' }
        ],
        gender: [{ required: true, message: '请输入性别', trigger: 'blur' }],
        openId: [{ required: true, message: '请输入openId', trigger: 'blur' }],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          {
            validator: checkMobile,
            message: '手机号码不正确，请重新输入',
            trigger: 'blur'
          }
        ]
      },
      radio: 1
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('auth/getwechatuserlist', {
        params: this.queryInfo
      })
      console.log(res)
      if (!res.success) {
        return this.$message.error('获取用户列表失败')
      }
      for (const item of res.wechatUserDOList) {
        if (item.enableStatus === 1) {
          item.enableStatus = true
        } else {
          item.enableStatus = false
        }
        if (item.gender === 1) {
          item.gender = '男'
        } else if (item.gender === 2) {
          item.gender = '女'
        } else {
          item.gender = '未知'
        }
      }
      // this.$message.success('获取用户列表成功')
      this.userList = res.wechatUserDOList
      this.total = res.count
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(current) {
      this.queryInfo.pagenum = current
      this.getUserList()
    },
    async userStateChanged(row) {
      row.enableStatus = row.enableStatus ? 1 : 0
      const { data: res } = await this.$http.post('auth/modifyWechatUser', {
        enableStatus: row.enableStatus,
        id: row.id
      })
      // console.log('update', res)
      if (!res.success) {
        row.enableStatus = !row.enableStatus
        return this.$message.error('修改状态失败')
      }
      row.enableStatus = !!row.enableStatus
      this.$message.success('更新状态成功')
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整用户信息')
        // 发送请求完成添加用户的操作
        const { data: res } = await this.$http.post('users', this.addForm)
        // 判断如果添加失败，就做提示
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        // 添加成功的提示
        this.$message.success('添加用户成功')
        // 关闭对话框
        this.addDialogVisible = false
        // 重新请求最新的数据
        this.getUserList()
      })
    },
    async showEditDialog(id) {
      // 发送请求根据id获取用户信息
      const { data: res } = await this.$http.get(
        'auth/getWechatUserByOpenId?id=' + id
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
    editDialogClosed() {
      // 对话框关闭之后，重置表达
      this.$refs.editFormRef.resetFields()
    },
    editUser() {
      // 用户点击修改表单中的确定按钮之后，验证表单数据
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整用户信息')
        // 发送请求完成修改用户的操作
        const { data: res } = await this.$http.post(
          'auth/modifyWechatUser',
          this.editForm
        )
        // 判断如果修改失败，就做提示
        if (!res.success) return this.$message.error('修改用户失败')
        // 修改成功的提示
        this.$message.success('修改用户成功')
        // 关闭对话框
        this.editDialogVisible = false
        // 重新请求最新的数据
        this.getUserList()
      })
    },
    async removeUserById(id) {
      // 弹出确定取消框，是否删除用户
      const confirmResult = await this.$confirm(
        '请问是否要永久删除该用户',
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
        'auth/deleteWechatUser?id=' + id
      )
      // 判断如果删除失败，就做提示
      if (!res.success) return this.$message.error('删除用户失败')
      // 修改成功的提示
      this.$message.success('删除用户成功')
      // 重新请求最新的数据
      this.getUserList()
    }
  }
}
</script>
<style scoped>
.el-table {
  margin-top: 15px;
}
.el-pagination {
  margin-top: 15px;
}
.hp {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
</style>
