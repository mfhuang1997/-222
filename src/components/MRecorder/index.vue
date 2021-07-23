<template>
  <div class="wrap-recorder">
    <el-row>
      <el-col>
        <svg
          :class="['icon', {anirecorder: recording } ]"
          t="1581399509621"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="3242"
          width="100"
          height="100"
          @click="handleClick"
        >
          <path
            d="M512 1024a512 512 0 1 1 512-512 512 512 0 0 1-512 512z m0-992a480 480 0 1 0 480 480A480 480 0 0 0 512 32z m16 623.2V736h48a16 16 0 0 1 0 32h-128a16 16 0 0 1 0-32h48v-80.8A160 160 0 0 1 352 496a16 16 0 0 1 32 0 128 128 0 0 0 256 0 16 16 0 0 1 32 0 160 160 0 0 1-144 159.2zM512 592a96 96 0 0 1-96-96v-144a96 96 0 0 1 192 0v144a96 96 0 0 1-96 96z m64-240a64 64 0 0 0-128 0v144a64 64 0 0 0 128 0v-144z"
            p-id="3243"
          />
        </svg>
      </el-col>
    </el-row>
    <p class="tip">{{ tiptext }}</p>
    <p class="tip">"雄关漫道真如铁，而今迈步从头越。"</p>
  </div>
</template>
<script>
import Recorder from 'js-audio-recorder'
import axios from 'axios'

export default {
  data() {
    return {
      tiptext: '请点击按钮，对着麦克风说：',
      recording: false, // 标记是否在录音
      intervaltimerid: '', // 间隔时间定时器编号
      recorder: null,
      time: 0,
      recordstep: 0,
      formData: null
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.recorder = new MP3Recorder({
        // numChannels: 1,     //声道数,默认为1
        // sampleRate: 8000,   //采样率,一般由设备提供,比如 48000
        bitRate: 128, // 比特率,不要低于64,否则可能录制无声音（人声）
        // useMediaRecorder: true, //是否使用MediaRecorder录音（不支持转码为mp3文件）
        // recorderType: "video/webm;codes=vp9",  //默认编码，仅 useMediaRecorder 为true且浏览器支持时生效
        // 录音结束事件
        complete: (blob, ext) => {
          var url = URL.createObjectURL(blob)
          this.$emit('handleStop', {
            url: url,
            mblob: blob
          })
        }
      })
    },
    // 点击处理
    // handleClick() {
    //   //录音支持检测
    //   if (!this.recorder.support) return;
    //   this.recording = !this.recording;
    //   this.$emit("handleStop", {
    //     url: "http://localhost/wav",
    //     mblob: null,
    //   });
    //   if (this.recording) {
    //     this.time = 0;
    //     this.tiptext = "录音中 " + this.time + "s";
    //     this.recorder.start(this.successFun(), this.errorFun());
    //   } else {
    //     clearInterval(this.intervaltimerid);
    //     this.recorder.stop();
    //     this.tiptext = "点击录音";
    //   }
    // },
    handleClick() {
      // 录音支持检测
      this.recording = true
      this.recordstep = this.recordstep + 1
      console.log('buzhou ' + this.recordstep)
      // 第一次录音
      if (this.recordstep == 1) {
        this.tiptext = '录音中'
        this.recorder = new Recorder(
          {
            sampleRate: 8000
          }
        )
        Recorder.getPermission().then(() => {
          console.log('开始录音')
          this.recorder.start() // 开始录音
          setTimeout(() => {
            this.handleStop()
            this.tiptext = '请再次点击按钮，对着麦克风说：'
            this.recording = false
            // 音频数据
            this.formData = new FormData()
            var blob1 = this.recorder.getPCMBlob()
            var newbolb1 = new Blob([blob1], { type: 'audio/pcm' })
            var fileOfBlob1 = new File([newbolb1], '19916970501' + '.pcm')
            this.formData.append('files', fileOfBlob1)
            //
          }, 5000)
        }, (error) => {
          this.$Message.info('请先允许该网页使用麦克风')
          console.log(`${error.name} : ${error.message}`)
        })
      }
      // 第二次录音
      if (this.recordstep == 2) {
        this.tiptext = '录音中'
        this.recorder = new Recorder(
          {
            sampleRate: 8000
          }
        )
        Recorder.getPermission().then(() => {
          console.log('开始录音')
          this.recorder.start() // 开始录音
          setTimeout(() => {
            this.handleStop()
            this.tiptext = '最后一次点击按钮，对着麦克风说'
            this.recording = false
            // 音频数据
            var blob2 = this.recorder.getPCMBlob()
            var newbolb2 = new Blob([blob2], { type: 'audio/pcm' })
            var fileOfBlob2 = new File([newbolb2], '19916970501' + '.pcm')
            this.formData.append('files', fileOfBlob2)
            //
          }, 5000)
        }, (error) => {
          this.$Message.info('请先允许该网页使用麦克风')
          console.log(`${error.name} : ${error.message}`)
        })
      }
      // 第三次录音
      if (this.recordstep == 3) {
        this.tiptext = '第三次录音中 请说“富强、民主、文明、和谐，自由、平等”'
        this.recorder = new Recorder(
          {
            sampleRate: 8000
          }
        )
        Recorder.getPermission().then(() => {
          console.log('开始录音')
          this.recorder.start() // 开始录音
          setTimeout(() => {
            this.handleStop()
            this.tiptext = '结束录音'
            this.recording = false
            this.recordstep = 0
            // 音频数据
            var blob3 = this.recorder.getPCMBlob()
            var newbolb3 = new Blob([blob3], { type: 'audio/pcm' })
            var fileOfBlob3 = new File([newbolb3], '19916970501' + '.pcm')
            this.formData.append('files', fileOfBlob3)
            console.log('发送数据')
            const instance = axios.create({
              headers: {
                'Content-Type': 'multipart/form-data'
              }})
            instance.post('http://10.144.108.209:30080/cutover/audioRegister2', this.formData).then(res => {
              // instance.post('http://132.150.103.186:28080/audioRegister', formData).then(res => {
              console.log(res)
              this.$message.info(res.data.message)
            })
            //
          }, 5000)
        }, (error) => {
          this.$Message.info('请先允许该网页使用麦克风')
          console.log(`${error.name} : ${error.message}`)
        })
      }
    },
    // 停止录音
    handleStop() {
      console.log('停止录音')
      this.recorder.stop() // 停止录音
    },
    writeError() {},
    successFun() {
      this.intervaltimerid = setInterval(() => {
        // 开始累积
        if (this.time == 120) {
          this.recorder.stop()
          this.recording = false
          this.tiptext = '点击录音'
          this.$message.warning('对不起，录音只支持120秒以内的语音！')
          clearInterval(this.intervaltimerid)
          return false
        }
        this.time = this.time + 1
        this.tiptext = '录音中 ' + this.time + 's'
      }, 6000)
    },
    errorFun(e) {
      // clearInterval(this.intervaltimerid);
      // switch (e.code || e.name) {
      //   case "PERMISSION_DENIED":
      //   case "PermissionDeniedError":
      //     // this.writeError("用户拒绝提供设备。");
      //     break;
      //   case "NOT_SUPPORTED_ERROR":
      //   case "NotSupportedError":
      //     // this.writeError("浏览器不支持硬件设备。");
      //     break;
      //   case "MANDATORY_UNSATISFIED_ERROR":
      //   case "MandatoryUnsatisfiedError":
      //     // this.writeError("无法发现指定的硬件设备。");
      //     break;
      //   default:
      //     // this.writeError(
      //     //   "无法打开麦克风。异常信息:" + (e.code || e.name)
      //     // );
      //     break;
      // }
    }
  }
}
</script>
<style scoped lang="scss">
.wrap-recorder {
  text-align: center;
  .icon {
    cursor: pointer;
  }
  .tip {
    padding-top: 20px;
    font-size: 20px;
  }
}
.anirecorder {
  fill:rgb(243, 11, 11);
  position: relative;
  animation: mymove 5s infinite;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;
  animation-play-state: running;
}

@keyframes mymove {
  0% {
    transform: scale(1); /*开始为原始大小*/
  }
  25% {
    transform: scale(1.1); /*放大1.1倍*/
  }
  50% {
    transform: scale(0.9);
  }
  75% {
    transform: scale(1.1);
  }
}
@-webkit-keyframes mymove /*Safari and Chrome*/
{
    0%{
    transform: scale(1);  /*开始为原始大小*/
    }
    25%{
        transform: scale(1.1); /*放大1.1倍*/
    }
    50%{
        transform: scale(1);
    }
    75%{
        transform: scale(1.1);
    }
}
</style>
