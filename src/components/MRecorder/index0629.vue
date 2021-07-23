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
          width="50"
          height="50"
          @click="handleClick"
        >
          <path
            d="M512 1024a512 512 0 1 1 512-512 512 512 0 0 1-512 512z m0-992a480 480 0 1 0 480 480A480 480 0 0 0 512 32z m16 623.2V736h48a16 16 0 0 1 0 32h-128a16 16 0 0 1 0-32h48v-80.8A160 160 0 0 1 352 496a16 16 0 0 1 32 0 128 128 0 0 0 256 0 16 16 0 0 1 32 0 160 160 0 0 1-144 159.2zM512 592a96 96 0 0 1-96-96v-144a96 96 0 0 1 192 0v144a96 96 0 0 1-96 96z m64-240a64 64 0 0 0-128 0v144a64 64 0 0 0 128 0v-144z"
            p-id="3243"
            fill="#707070"
          />
        </svg>
      </el-col>
    </el-row>
    <p class="tip">{{ tiptext }}</p>
  </div>
</template>
<script>
export default {
  data() {
    return {
      tiptext: '点击录音',
      recording: false, // 标记是否在录音
      intervaltimerid: '', // 间隔时间定时器编号
      recorder: null,
      time: 0
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
    handleClick() {
      // 录音支持检测
      if (!this.recorder.support) return
      this.recording = !this.recording
      this.$emit('handleStop', {
        url: 'http://localhost/wav',
        mblob: null
      })
      if (this.recording) {
        this.time = 0
        this.tiptext = '录音中 ' + this.time + 's'
        this.recorder.start(this.successFun(), this.errorFun())
      } else {
        clearInterval(this.intervaltimerid)
        this.recorder.stop()
        this.tiptext = '点击录音'
      }
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
      }, 1000)
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
  }
}
.anirecorder {
  position: relative;
  animation: mymove 5s infinite;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;
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
</style>
