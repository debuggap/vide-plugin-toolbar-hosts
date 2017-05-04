<template>
  <div class="hosts">
    <div class="lists">
      <div :class="{item: 1, active: publicIndex === 'current'}" @click="showCurrent">current hosts</div>
      <div :class="{item: 1, active: publicIndex === 'common'}" @click="showCommon">common hosts</div>
      <h3>hosts</h3>
      <ul>
        <li :class="{item: true, active: lastIndex === index}" v-for="(item, index) in lists" @click="showHost(index)">{{item}}</li>
      </ul>
    </div>
    <div class="content">
      <textarea class="textarea" @blur="savePrevious" ref="textarea">{{content}}</textarea>
    </div>
    <div class="tool">
      <el-button class="plus bg" type="primary" icon="plus" size="mini" @click="add"></el-button>
      <el-button class="minus bg" type="primary" icon="minus" size="mini" @click="remove"></el-button>
      <el-button class="setting bg" type="primary" icon="circle-check" size="mini" @click="setting"></el-button>
    </div>
  </div>
</template>

<script>
import localforage from 'localforage'

localforage.config({
  driver: localforage.WEBSQL,
  name: 'hosts',
  version: 1.0,
  size: 49807360,
  storeName: 'hostslists',
  description: 'hosts tool'
})
let store = localforage.createInstance({
  name: 'hosts_instance'
})

export default {
  props: ['callback'],
  data () {
    return {
      lists: [],
      cache: {},
      content: '',
      lastIndex: 0,
      publicIndex: '',
      common: ''
    }
  },
  watch: {
    content () {
      this.$refs.textarea.value = this.content
    }
  },
  mounted () {
    store.getItem('lists').then((value) => {
      if (value && value.length) {
        this.lists = value
        store.getItem('lastIndex').then((index) => {
          if (index >= this.lists.length) {
            index = this.lists.length - 1
          }
          this.lastIndex = index
          Promise.all([store.getItem(this.lists[index]), store.getItem('common')]).then(([content, common]) => {
            this.content = content
            this.common = common
            this.cache[this.lists[this.lastIndex]] = content
          })
        })
      } else {
        this.lists = ['online']
        this.content = '# online\n'
        this.common = '# this is common hosts\n'
        this.lastIndex = 0
        store.setItem('lists', this.lists)
        store.setItem('online', this.content)
        store.setItem('lastIndex', this.lastIndex)
        store.setItem('common', this.common)
      }
    })
  },
  methods: {
    add () {
      let value = prompt('Enter host name')
      if (value) {
        if (this.lists.includes(value) || ['lists', 'lastIndex', 'common'].includes(value)) {
          alert('Host exists')
          return
        }
        this.lists.push(value)
        store.setItem('lists', this.lists).then(() => {
          this.content = `# ${value}\n`
          this.cache[value] = this.content
          this.lastIndex = this.lists.length - 1
          // store content
          store.setItem(value, this.content)
        })
      }
    },
    remove () {
      this.cache[this.lists[this.lastIndex]] = null
      this.lists.splice(this.lastIndex, 1)
      store.setItem('lists', this.lists).then(() => {
        if (this.lists.length) {
          this.lastIndex = this.lists.length - 1
          this.showHost(this.lastIndex)
        }
      })
    },
    showHost (index) {
      this.publicIndex = ''
      this.lastIndex = index
      if (this.cache[index]) {
        this.content = this.cache[index]
      } else {
        store.getItem(this.lists[index]).then((value) => {
          this.content = value
          this.cache[this.lists[this.lastIndex]] = value
        })
      }
    },
    showCommon () {
      this.publicIndex = 'common'
      store.getItem('common').then((value) => {
        this.common = value
        this.content = this.common
      })
    },
    showCurrent () {
      this.publicIndex = 'current'
      window.require('fs').readFile('/etc/hosts', (error, value) => {
        if (error) {
          alert(error.message)
        } else {
          this.content = value
        }
      })
    },
    savePrevious () {
      if (this.publicIndex) {
        if (this.publicIndex === 'common') {
          this.common = this.$refs.textarea.value
          store.setItem('common', this.common)
        }
      } else {
        let value = this.lists[this.lastIndex]
        this.cache[value] = this.$refs.textarea.value
        store.setItem(value, this.$refs.textarea.value)
      }
    },
    setting () {
      this.savePrevious()
      store.setItem('lastIndex', this.lastIndex)
      let value = this.common + '\n' + this.cache[this.lists[this.lastIndex]]
      window.require('fs').writeFile('/etc/hosts', value, (error) => {
        if (error) {
          alert(error.message)
        } else {
          this.callback()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.hosts {
  $bottomHeight: 30px;
  $bgColor:rgb(207,50,46);
  $color:rgb(207,50,46);
  
  position:absolute;
  border:1px solid #ccc;
  z-index: 222;
  width: 600px;
  height:500px;
  left: 50%;
  top:50%;
  margin-left: -300px;
  margin-top:-250px;
  background-color:#fff;
  
  #hosts_editor {
    width:100%;
    height:100%;
  }
  
  h3,ul {
    padding:0px;
    margin:0px;
  }
  h3 {
    padding-left:10px;
  }
  
  .lists {
    width: 150px;
    position:absolute;
    left:0px;
    top:0px;
    bottom:$bottomHeight;
    border-right: 1px solid #ccc;
    background-color:rgb(238,241,246);
    color:#8492A6;
    overflow-x: hidden;
    overflow-y: auto;
    
    .item {
      height: 30px;
      line-height: 30px;
      padding: 0px 5px 0px 25px;
      overflow: hidden;
      cursor: pointer;
      background-size: 15px 15px;
      background-repeat: no-repeat;
      background-position: 5px;
      background-image: url(./assets/logo.png);
    }
    .active {
      color:$color;
    }
  }
  .content {
    position: absolute;
    top:0px;
    right:0px;
    left:150px;
    bottom: $bottomHeight
  }
  
  .textarea {
    width: 100%;
    height: 100%;
    padding: 0px;
    box-sizing: border-box;
    border: none;
    outline: none;
  }
  
  .tool {
    position:absolute;
    left:0px;
    right:0px;
    bottom:0px;
    border-top:1px solid #ccc;
    height:$bottomHeight
  }
  
  .minus, .plus {
    margin-top:4px;
    margin-left:10px;
  }
  
  .bg {
    background-color: $bgColor;
    border-color: rgb(207,50,46);
  }
  
  .setting {
    width: 50px;
    position: absolute;
    right: 10px;
    top: 4px;
  }
}
</style>
