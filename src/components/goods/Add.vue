<template>
  <div>
    <h3 v-if="type === 'add'">添加商品</h3>
    <h3 v-else>修改商品</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item v-if="type === 'add'">添加商品</el-breadcrumb-item>
      <el-breadcrumb-item v-else>修改商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 消息提示 -->
      <el-alert title="添加商品信息" v-if="type === 'add'" type="info" center show-icon :closable="false"></el-alert>
      <el-alert title="修改商品信息" v-else type="info" center show-icon :closable="false"></el-alert>

      <!-- 步骤条组件 -->
      <!-- align-center(居中效果) -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="联系方式"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域:el-tab-pane必须是el-tabs的子节点
      :tab-position="'left'"(设置tab栏为左右结构tab栏)-->
      <!-- 表单：label-position="top"(设置label在文本框上方) -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="productName">
              <el-input v-model="addForm.productName"></el-input>
            </el-form-item>
            <el-form-item label="商品现价" prop="promotionPrice">
              <el-input v-model="addForm.promotionPrice" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品原价" prop="normalPrice">
              <el-input v-model="addForm.normalPrice" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="productCategoryId">
              <!-- 选择商品分类的下拉选择框 -->
              <el-select v-model="addForm.productCategoryId" placeholder="请选择" @change="cateSelect">
                <el-option
                  v-for="item in cateList"
                  :key="item.productCategoryId"
                  :label="item.productCategoryName"
                  :value="item.productCategoryId"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="商品区域" prop="areaId">
              <!-- 选择商品分区域的下拉选择框 -->
              <el-select v-model="addForm.areaId" placeholder="请选择" @click="areaSelect">
                <el-option
                  v-for="item in areaList"
                  :key="item.areaId"
                  :label="item.areaName"
                  :value="item.areaId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="联系方式" name="1">
            <!-- 渲染表单item项 -->
            <el-form-item label="联系人" prop="linkman">
              <el-input v-model="addForm.linkman"></el-input>
            </el-form-item>
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="addForm.contactPhone" type="phone"></el-input>
            </el-form-item>
            <el-form-item label="联系微信" prop="contactWechat">
              <el-input v-model="addForm.contactWechat"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 商品图片上传 -->
            <el-upload
              action="#"
              list-type="picture-card"
              :on-change="handleChange"
              :auto-upload="false"
            >
              <i slot="default" class="el-icon-plus"></i>
              <div slot="file" slot-scope="{file}">
                <img class="el-upload-list__item-thumbnail" :src="file.url" alt />
                <span class="el-upload-list__item-actions">
                  <span
                    class="el-upload-list__item-preview"
                    @click="handlePictureCardPreview(file)"
                  >
                    <i class="el-icon-zoom-in"></i>
                  </span>
                  <span
                    v-if="!disabled"
                    class="el-upload-list__item-delete"
                    @click="handleRemove(file)"
                  >
                    <i class="el-icon-delete"></i>
                  </span>
                </span>
              </div>
            </el-upload>
            <el-dialog :visible.sync="dialogVisible">
              <img width="100%" :src="dialogImageUrl" alt />
            </el-dialog>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.productDesc"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" v-if="type === 'add'" class="btnAdd" @click="add">添加商品</el-button>
            <el-button type="primary" v-else class="btnAdd" @click="add">修改商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <!-- 预览图片对话框 -->
      <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
        <img :src="previewPath" class="previewImg" />
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
// 官方推荐将lodash导入为_
import _ from 'lodash'
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
      // 修改or删除
      type: 'add',
      activeIndex: 0,

      addForm: {
        productName: '',
        promotionPrice: 0,
        normalPrice: 0,
        productCategoryId: '',
        areaId: '',
        linkman: '',
        contactPhone: '',
        contactWechat: '',
        productDesc: ''
      },
      formData: new FormData(),
      addFormRules: {
        productName: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        promotionPrice: [
          { required: true, message: '请输入商品现价', trigger: 'blur' }
        ],
        productCategoryId: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ],
        areaId: [
          { required: true, message: '请选择商品区域', trigger: 'blur' }
        ],
        linkman: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        contactPhone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          {
            validator: checkMobile,
            message: '手机号码不正确，请重新输入',
            trigger: 'blur'
          }
        ],
        contactWechat: [
          { required: true, message: '请输入联系微信', trigger: 'blur' }
        ]
      },
      // 用来保存分类数据
      cateList: [],
      // 用来保存区域数据
      areaList: [],

      // 保存预览图片的url地址
      previewPath: '',
      // 控制预览图片对话框的显示和隐藏
      previewVisible: false,
      // 图片数组
      fileList: [],
      // 图片预览地址
      dialogImageUrl: '',
      // 图片预览对话框是否可见
      dialogVisible: false,
      disabled: false,
      productId: 0
    }
  },
  created() {
    this.getCateList()
    this.getAreaList()
    const type = sessionStorage.getItem('type')
    if (type !== null) {
      this.type = type
    }
    console.log('type:', this.type)
    const productId = this.$route.query.productId
    this.productId = productId
    // console.log('this.$route.query:', this.$route.query)
    if (type === 'modify') {
      this.getProductById(productId)
    }
  },
  methods: {
    async getProductById(productId) {
      const { data: res } = await this.$http.get(
        'useradmin/getproductbyid?productId=' + productId
      )
      if (!res.success) {
        return this.$message.error('获取商品数据失败')
      }
      this.$message.success('获取商品数据成功')
      console.log(res)
      this.addForm = {
        productName: res.product.productName,
        promotionPrice: res.product.promotionPrice,
        normalPrice: res.product.normalPrice,
        productCategoryId: res.product.productCategory.productCategoryId,
        areaId: res.product.area.areaId,
        linkman: res.product.linkman,
        contactPhone: res.product.contactPhone,
        contactWechat: res.product.contactWechat,
        productDesc: res.product.productDesc
      }
      if (sessionStorage.getItem('type') === 'modify') {
        this.addForm.productId = this.productId
      }
    },

    urltoImage(url, fn) {
      var img = new Image()
      img.src = url
      img.onload = function() {
        fn(img)
      }
    },
    async getCateList() {
      const { data: res } = await this.$http.get(
        'useradmin/getproductcategorylist'
      )
      if (!res.success) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.cateList = res.data
    },
    async getAreaList() {
      const { data: res } = await this.$http.get('superadmin/listarea')
      if (res.rows.length <= 0) {
        return this.$message.error('获取区域分类数据失败')
      }
      this.areaList = res.rows
    },
    cateSelect(productCategoryId) {
      this.addForm.productCategoryId = productCategoryId
    },
    areaSelect(areaId) {
      this.addForm.areaId = areaId
    },
    beforeTabLeave(activeName, oldActiveName) {
      // 在tab栏切换之前触发，两个形参为切换前，后的tab栏name
      if (oldActiveName === '0') {
        // 在第一个标签页的时候
        if (this.addForm.productName.trim() === '') {
          this.$message.error('请输入商品名称')
          return false
        } else if (this.addForm.promotionPrice.toString().trim() === '0') {
          this.$message.error('请输入商品现价')
          return false
        } else if (this.addForm.productCategoryId.toString().trim() === '') {
          this.$message.error('请输入商品分类')
          return false
        } else if (this.addForm.areaId.toString().trim() === '') {
          this.$message.error('请输入商品区域')
          return false
        }
      }
    },
    handleChange(file, fileList) {
      console.log('handleChange', file)
      console.log('handleChange', fileList)
      this.fileList = fileList
    },
    handleRemove(file) {
      console.log(file)
      console.log(this.fileList)
      const index = this.fileList.findIndex(item => item.url === file.url)
      // 移除索引对应的图片
      this.fileList.splice(index, 1)
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项!')

        // 将addForm进行深拷贝，避免双向绑定带来的报错
        const form = _.cloneDeep(this.addForm)

        form.area = { areaId: form.areaId }
        delete form.areaId
        form.productCategory = { productCategoryId: form.productCategoryId }
        delete form.productCategoryId

        this.formData.append('productStr', JSON.stringify(form))

        console.log('this.fileList', this.fileList)
        console.log('this.fileList', this.fileList.length)
        for (let i = 0; i < this.fileList.length; i++) {
          console.log('i', i)
          if (i === 0) {
            this.formData.append('thumbnail', this.fileList[i].raw)
          }
          this.formData.append('productImg' + i, this.fileList[i].raw)
        }
        console.log('formData', this.formData)
        console.log('formData', this.formData.productStr)
        // 发送请求完成商品的添加,商品名称必须是唯一的
        if (sessionStorage.getItem('type') === 'modify') {
          console.log(this.productId)

          const { data: res } = await this.$http.post(
            'useradmin/modifyproduct',
            this.formData
          )
          console.log('modifyResult:', res)
          if (!res.success) {
            return this.$message.error('修改商品失败')
          }
          this.$message.success('修改商品成功')
        } else {
          const { data: res } = await this.$http.post(
            'useradmin/addproduct',
            this.formData
          )
          console.log('addResult:', res)
          if (!res.success) {
            return this.$message.error('添加商品失败')
          }
          this.$message.success('添加商品成功')
        }

        // 编程式导航跳转到商品列表
        this.$router.push('/goods')
      })
    }
  }
}
</script>
<style lang="less" scoped>
.previewImg {
  width: 100%;
}
// 给添加商品按钮添加间距
.btnAdd {
  margin-top: 15px;
}
</style>
