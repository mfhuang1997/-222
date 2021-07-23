<template>
  <!-- <div class="app-container">
    <div class="filter-container">
       <MRecorder @handleStop="handelEndRecord" />
      <el-button type="primary" @click="handleVery">声纹验证</el-button>
    </div>
  </div> -->
  <div class="container">
    <div class="left_Sidebar">
      <div class="left_Sidebar_header">
        <label />
        <span>声纹注册</span>
      </div>
      <div class="left_Sidebar_body">
        <MRecorder @handleStop="handelEndRecord" />
      </div>
    </div>
    <div class="right_Sidebar">
      <div class="right_Sidebar_header">
        <label />
        <span>声纹验证</span>
      </div>
      <div class="right_Sidebar_body">
        <div class="body_content">
          <div class="body_content_step">
            <ul class="content_step">
              <el-button type="primary" @click="handleVery">声纹验证1</el-button>
              <br>
            </ul>
          </div>
          <div class="body_content_btn" />

        </div>

        <div style="clear: both;" />
        <!-- <div class="local_header">
                    <label></label>
                    <span>备注信息</span>
                </div> -->
        <div class="local_body" />
      </div>
    </div>

  </div>
</template>

<script>
// import axios from 'axios'
import lamejs from 'lamejs'
// 引入recorder.js
import MRecorder from '@/components/MRecorder'
import recording from '@/utils/recorder.js'
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils/indexruoyi'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import Recorder from 'js-audio-recorder'
import axios from 'axios'

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination, MRecorder },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tiptext: '点击验证',
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: '声纹注册'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    // this.getList()
  },
  methods: {
    // 转换mp3
    convertToMp3(wavDataView) {
      // 获取wav头信息
      const wav = lamejs.WavHeader.readHeader(wavDataView) // 此处其实可以不用去读wav头信息，毕竟有对应的config配置
      const { channels, sampleRate } = wav
      console.log('wav', wav)
      const mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, 128)
      // 获取左右通道数据
      const result = recorder.getChannelData()
      const buffer = []

      const leftData = result.left && new Int16Array(result.left.buffer, 0, result.left.byteLength / 2)
      const rightData = result.right && new Int16Array(result.right.buffer, 0, result.right.byteLength / 2)
      const remaining = leftData.length + (rightData ? rightData.length : 0)

      const maxSamples = 1152
      for (let i = 0; i < remaining; i += maxSamples) {
        const left = leftData.subarray(i, i + maxSamples)
        let right = null
        let mp3buf = null
        if (channels === 2) {
          right = rightData.subarray(i, i + maxSamples)
          mp3buf = mp3enc.encodeBuffer(left, right)
        } else {
          mp3buf = mp3enc.encodeBuffer(left)
        }
        if (mp3buf.length > 0) {
          buffer.push(mp3buf)
        }
      }

      const enc = mp3enc.flush()

      if (enc.length > 0) {
        buffer.push(enc)
      }

      return new Blob(buffer, { type: 'audio/mp3' })
    },

    // 录音处理结束事件
    handelEndRecord(param) {
      console.log(param)
      this.msource = param
    },

    // 录音
    handleVery() {
      this.recorder = new Recorder(
        {
          sampleRate: 8000
        }
      )
      this.tiptext = '录音中'
      Recorder.getPermission().then(() => {
        console.log('开始录音')
        this.recorder.start() // 开始录音
        setTimeout(() => {
          this.handleStop()
          this.tiptext = '验证录音结束'
          this.recording = false
          // 音频数据
          var formData = new FormData()
          var blob1 = this.recorder.getPCMBlob()
          var newbolb1 = new Blob([blob1], { type: 'audio/pcm' })
          var fileOfBlob1 = new File([newbolb1], '19916970501' + '.pcm')
          formData.append('file', fileOfBlob1)
          const instance = axios.create({
            headers: {
              'Content-Type': 'multipart/form-data'
            }})
          instance.post('http://10.144.108.209:30080/cutover/vprVerify', formData).then(res => {
            // instance.post('http://132.150.103.186:28080/audioRegister', formData).then(res => {
            console.log(res)
          })
          //
        }, 5000)
      }, (error) => {
        this.$Message.info('请先允许该网页使用麦克风')
        console.log(`${error.name} : ${error.message}`)
      })
    },
    // 开始录音
    handleStart() {
      this.recorder = new Recorder()
      Recorder.getPermission().then(() => {
        console.log('开始录音')
        this.recorder.start() // 开始录音
        // 一段时间停止录音
        // setTimeout(this.handleStop(),20000)
        setTimeout(() => {
          this.handleStop()
        }, 2500)
      }, (error) => {
        this.$Message.info('请先允许该网页使用麦克风')
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
      // var fileOfBlob = new File([newbolb],'tset2585' + '.wav')
      var fileOfBlob = new File([newbolb], 'ceshi.wav')
      // var fileOfBlob = new File([newbolb], new Date().getTime() + '.wav')
      formData.append('file', fileOfBlob)
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

    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleCreate() {
      // this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>

<style lang="scss" scoped>
.app-main{
    overflow-y: auto;
    overflow-x: hidden;
}
.container{
    margin: 10px;
    padding: 16px 15px;
    font-size: 14px;
    color: rgb(28, 28, 28);
    .left_Sidebar{
        width: 60%;
        height: 300px;
        float: left;
        .left_Sidebar_header{
            width: 100%;
            height: 40px;
            padding-top: 10px;
            border-bottom: 1px solid #ccc;
            span{
                display: inline-block;
                float: left;
                margin-left: 10px;
                line-height: 20px;
            }
            label{
                display: inline-block;
                width: 6px;
                height: 20px;
                background-color: #1890ff;
                float: left;
            }
        }
        .left_Sidebar_body{
            width: 100%;
            margin-top: 34px;
            p{
               width: 100%;
               overflow: hidden;
               white-space: normal;
               word-break: break-all;
               margin-bottom: 20px;
            }
        }
    }
    .right_Sidebar{
        width: 35%;
        height: 300px;
        float: left;
        margin-left: 2%;
        .right_Sidebar_header{
            width: 100%;
            height: 40px;
            padding-top: 10px;
            border-bottom: 1px solid #ccc;
            span{
                display: inline-block;
                float: left;
                margin-left: 10px;
                line-height: 20px;
            }
            label{
                display: inline-block;
                width: 6px;
                height: 20px;
                background-color: #1890ff;
                float: left;
            }
        }
        .right_Sidebar_body{
          padding-bottom: 50px;
            .body_content{
                .body_content_step{
                    width: 100%;
                    height: 140px;
                    .content_step{
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        li{
                           height: 80px;
                           margin:20px 20px 0;
                            div{
                                width: 50px;
                                height: 160px;
                                float: left;
                                overflow: hidden;
                                white-space: normal;
                                text-overflow: ellipsis;
                                text-align: center;
                                .bgc{
                                    cursor: pointer;
                                    background-color: #1890ff;
                                    color: #fff;
                                    cursor: pointer;
                                }
                                span{
                                    cursor: pointer;
                                    display: inline-block;
                                    width: 50px;
                                    height: 50px;
                                    text-align:center;
                                    line-height: 50px;
                                    border-radius: 50%;
                                    border: 1px solid #1890ff;
                                }
                                label{
                                    line-height: 25px;

                                }
                            }
                            span{
                                float: left;
                                display: inline-block;
                                width: 100%;
                                height: 4px;
                                margin-top: 11%;
                            }
                        }
                    }
                }
                .body_content_btn{
                    float: right;
                    margin-bottom: 100px;
                    margin-right: 100px;
                }
            }
            .local_header{
                width: 100%;
                height: 40px;
                padding-top: 10px;
                border-bottom: 1px solid #ccc;
                span{
                    display: inline-block;
                    float: left;
                    margin-left: 10px;
                    line-height: 20px;
                }
                label{
                    display: inline-block;
                    width: 6px;
                    height: 20px;
                    background-color: rgb(0, 132, 255);
                    float: left;
                }
            }
            .local_body{
                width: 100%;
                margin-top: 34px;
                p{
                  width: 100%;
                  overflow: hidden;
                  white-space: normal;
                  word-break: break-all;
                  margin-bottom: 15px;
                  line-height: 20px;
                }
            }
        }
    }
}
</style>
