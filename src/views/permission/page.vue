<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        sw
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleAdd">
        新增
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleExport">
        下载
      </el-button>
      <!-- <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        reviewer
      </el-checkbox> -->
    </div>

    <el-table v-loading="loading" :data="cutoverList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="割接名称" align="center" prop="cutoverName" />
      <el-table-column label="割接编号" align="center" prop="cutoverId" />
      <el-table-column label="割接时间" align="center" prop="checkTime" width="180">
        <template slot-scope="scope">
          <!-- <span>{{ parseTime(scope.row.cutoverTime, '{y}-{m}-{d}-{h}') }}</span> -->
          <!-- <span>{{ parseTime(scope.row.cutoverTime) }}</span> -->
          <span>{{ scope.row.cutoverTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作人" align="center" prop="operator" />
      <el-table-column label="审核人" align="center" prop="checker" />
      <el-table-column label="电话号码" align="center" prop="checkerNumber" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleCreate(scope.row)"
          >声纹注册</el-button>
          <el-dropdown>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-s-promotion"
            >更多</el-button>
            <el-dropdown-menu slot="dropdown" split-button>
              <el-dropdown-item @click.native="handlSend(scope.row)">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                >执行割接任务</el-button>
              </el-dropdown-item>

              <!-- <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除</el-button> -->
              <el-dropdown-item @click.native="handleUpdate(scope.row)">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                >修改</el-button>
              </el-dropdown-item>
              <el-dropdown-item @click.native="handleDownload(scope.row)">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-download"
                >下载</el-button>
              </el-dropdown-item>

            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" /> -->

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改割接辅助对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="割接名称" prop="cutoverName">
          <el-input v-model="form.cutoverName" placeholder="请输入割接名称" />
        </el-form-item>
        <el-form-item label="割接编号" prop="cutoverId">
          <el-input v-model="form.cutoverId" placeholder="请输入割接编号" />
        </el-form-item>
        <el-form-item label="割接时间" prop="cutoverTime">
          <el-date-picker
            v-model="form.cutoverTime"
            clearable
            size="small"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetime"
            placeholder="选择割接时间"
          />
        </el-form-item>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="form.operator" placeholder="请输入操作人" />
        </el-form-item>
        <el-form-item label="审核人" prop="checker">
          <el-input v-model="form.checker" placeholder="请输入审核人" />
        </el-form-item>
        <el-form-item label="电话号码" prop="checkerNumber">
          <el-input v-model="form.checkerNumber" placeholder="请输入电话号码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 声纹注册 -->
    <el-dialog :title="vprtitle" :visible.sync="vpropen" width="500px" append-to-body>
      <el-card class="box-card">
        提示性语句：点击开始录音后，请说“xxxxxx",录制完成后请点击停止录音，点击播放录音可查看录制效果，点击上传进行声纹注册
      </el-card>
      <div style="font-size:14px">
        <h3>录音时长：{{ recorder&&recorder.duration.toFixed(4) }}</h3>
        <br>
        <el-button type="primary" @click="handleStart">开始录音</el-button>
        <!-- <el-button type="info" @click="handlePause">暂停录音</el-button>
        <el-button type="success" @click="handleResume">继续录音</el-button> -->
        <el-button type="warning" @click="handleStop">停止录音</el-button>

        <br>
        <br>
        <h3>播放时长：{{ recorder&&(playTime>recorder.duration?recorder.duration.toFixed(4):playTime.toFixed(4)) }}</h3>
        <br>
        <el-button type="primary" @click="handlePlay">播放录音</el-button>
        <!-- <el-button type="info" @click="handlePausePlay">暂停播放</el-button>
        <el-button type="success" @click="handleResumePlay">继续播放</el-button>
        <el-button type="warning" @click="handleStopPlay">停止播放</el-button> -->
        <el-button type="error" @click="handleDestroy">销毁录音</el-button>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelvpr">
          取消
        </el-button>
        <el-button type="primary" @click="uploadRecord">
          上传
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listCutover, getCutover, delCutover, addCutover, updateCutover, sendTask, exportCutover, downloadCutover, downloadgejie } from '@/api/cutover'
import axios from 'axios'
import { downLoadZip } from '@/utils/zipdownload'
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import Recorder from 'js-audio-recorder'

export default {
  name: 'Cutover',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      // audio名字
      vprFileName: '',
      // 选中的任务名
      selectnames: [],
      // 发起审核参数
      sendQuery: {
        id: ''
      },
      // 下载参数
      downloadQuery: {
        taskId: ''
      },
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 割接辅助表格数据
      cutoverList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,

      // vpr弹出层标题
      vprtitle: '',
      // 是否显示弹出层
      vpropen: false,

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        cutoverName: null,
        cutoverId: null,
        cutoverTime: null,
        operator: null,
        checker: null,
        checkerNumber: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        cutoverName: [
          { required: true, message: '割接名称不能为空', trigger: 'blur' }

        ],
        cutoverId: [
          { required: true, message: '割接编号不能为空', trigger: 'blur' }
        ],
        cutoverTime: [
          { required: true, message: '割接时间不能为空', trigger: 'blur' }
        ],
        operator: [
          { required: true, message: '操作人不能为空', trigger: 'blur' }
        ],
        checker: [
          { required: true, message: '审核人不能为空', trigger: 'blur' }
        ],
        checkerNumber: [
          { required: true, message: '电话号码不能为空', trigger: 'blur' },
          { min: 11, max: 11, message: '电话号码必须为11位', trigger: 'blur' },
          { type: 'number', transform(checkerNumber) { return Number(checkerNumber) }, message: '电话号码必须为数字' }
        ]
      }
      //
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 录音
    // 开始录音
    handleStart() {
      this.recorder = new Recorder()
      Recorder.getPermission().then(() => {
        console.log('开始录音')
        this.recorder.start() // 开始录音
      }, (error) => {
        this.$confirm('请先允许该网页使用麦克风')
        console.log(`${error.name} : ${error.message}`)
      })
    },
    handlePause() {
      console.log('暂停录音')
      this.recorder.pause() // 暂停录音
    },
    handleResume() {
      console.log('恢复录音')
      this.recorder.resume() // 恢复录音
    },
    handleStop() {
      console.log('停止录音')
      this.recorder.stop() // 停止录音
    },
    handlePlay() {
      console.log('播放录音')
      this.recorder.play() // 播放录音

      // 播放时长
      this.timer = setInterval(() => {
        try {
          this.playTime = this.recorder.getPlayTime()
        } catch (error) {
          this.timer = null
        }
      }, 100)
    },
    handlePausePlay() {
      console.log('暂停播放')
      this.recorder.pausePlay() // 暂停播放

      // 播放时长
      this.playTime = this.recorder.getPlayTime()
      this.time = null
    },
    handleResumePlay() {
      console.log('恢复播放')
      this.recorder.resumePlay() // 恢复播放

      // 播放时长
      this.timer = setInterval(() => {
        try {
          this.playTime = this.recorder.getPlayTime()
        } catch (error) {
          this.timer = null
        }
      }, 100)
    },
    handleStopPlay() {
      console.log('停止播放')
      this.recorder.stopPlay() // 停止播放

      // 播放时长
      this.playTime = this.recorder.getPlayTime()
      this.timer = null
    },
    handleDestroy() {
      console.log('销毁实例')
      this.recorder.destroy() // 毁实例
      this.timer = null
    },
    uploadRecord() {
      const instance = axios.create({
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      const contentType = 'application/json'

      if (this.recorder == null || this.recorder.duration === 0) {
        // this.$Message.error('请先录音')
        this.msgInfo('请先录音')
        return false
      }
      this.recorder.pause() // 暂停录音
      this.timer = null
      console.log('上传录音')// 上传录音
      var formData = new FormData()
      var blob = this.recorder.getWAVBlob()// 获取wav格式音频数据
	  // 此处获取到blob对象后需要设置fileName满足当前项目上传需求，其它项目可直接传把blob作为file塞入formData
      var newbolb = new Blob([blob], { type: 'audio/wav' })
      var fileOfBlob1 = new File([newbolb], 'tset2585' + '.wav')
      var fileOfBlob = new File([newbolb], this.vprFileName)

      // var fileOfBlob = new File([newbolb], new Date().getTime() + '.wav')
      formData.append('files', fileOfBlob)
      // formData.append('files', fileOfBlob1)
      console.log(formData.getAll('files'))
	  // 本地公共上传接口获取到服务器地址保存即可、

      // const axios = require('axios')
      // axios.post(this.resource, formData).then(res => {
      //   console.log(res.data.data[0].url)

      instance.post('http://localhost:28080/audioRegister', formData).then(res => {
      // instance.post('http://132.150.103.186:28080/audioRegister', formData).then(res => {
        console.log(res)
   		// 开始调用保存的方法
        this.uploadRecordModal = false
      })
    },

    /** 查询割接辅助列表 */
    getList() {
      this.loading = true
      listCutover(this.queryParams).then(response => {
        this.cutoverList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 取消按钮
    cancelvpr() {
      console.log('tttttttt')
      this.vpropen = false
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        cutoverName: null,
        cutoverId: null,
        cutoverTime: null,
        operator: null,
        checker: null,
        checkerNumber: null
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.selectnames = []
      this.ids = selection.map(item => item.cutoverName)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加割接信息'
    },
    handleCreate(row) {
      this.vprFileName = row.checkerNumber + '.wav'
      this.vpropen = true
      this.vprtitle = '注册声纹'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getCutover(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改割接信息'
      })
    },
    /** 下载 */
    handleDownload(row) {
      this.downloadQuery.taskId = row.id
      downloadCutover(this.downloadQuery).then(response => {
        this.downloadQuery.fileName = response.msg
        console.log(response.data)
        downLoadZip('/cutover/download?fileName=' + this.downloadQuery.fileName)
        // downloadgejie(this.downloadQuery)
      })
    },
    /** 发起审核 */
    handlSend(row) {
      // this.reset();
      // this.sendQuery.id = row.id;
      // sendTask(this.sendQuery).then(response => {
      //   console.log(response.data)
      // });
      this.msgSuccess('执行割接任务成功')
    },
    /** 提交按钮 */
    submitForm() {
      // this.form.cutoverTime = me.$moment(this.form.cutoverTime)
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateCutover(this.form).then(response => {
              this.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addCutover(this.form).then(response => {
              this.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm('是否确认删除割接辅助编号为"' + ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delCutover(ids)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      })
    },
    /** 导出按钮操作 */
    // handleExport() {
    //   const queryParams = this.queryParams;
    //   this.$confirm('是否确认导出所有割接辅助数据项?', "警告", {
    //       confirmButtonText: "确定",
    //       cancelButtonText: "取消",
    //       type: "warning"
    //     }).then(function() {
    //       return exportCutover(queryParams);
    //     }).then(response => {
    //       this.download(response.msg);
    //     })
    // },
    handleExport() {
      const item = {
        idList: this.ids
      }
      this.$confirm('是否确认导出割接名称为' + this.selectnames + '的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return exportCutover(item)
      }).then(response => {
        this.download(response.data)
      })
    }
  }

}
</script>
