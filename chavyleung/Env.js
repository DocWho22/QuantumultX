<<<<<<< HEAD
function Env(name) {
  this.name = name
  this.logs = []
  this.isSurge = () => 'undefined' !== typeof $httpClient
  this.isQuanX = () => 'undefined' !== typeof $task
  this.log = (...log) => {
    this.logs = [...this.logs, ...log]
    if (log) console.log(log.join('\n'))
    else console.log(this.logs.join('\n'))
  }
  this.msg = (title = this.name, subt = '', desc = '') => {
    if (this.isSurge()) $notification.post(title, subt, desc)
    if (this.isQuanX()) $notify(title, subt, desc)
    const _logs = ['', '==============📣系统通知📣==============']
    if (title) _logs.push(title)
    if (subt) _logs.push(subt)
    if (desc) _logs.push(desc)
    console.log(_logs.join('\n'))
  }
  this.getdata = (key) => {
    if (this.isSurge()) return $persistentStore.read(key)
    if (this.isQuanX()) return $prefs.valueForKey(key)
  }
  this.setdata = (val, key) => {
    if (this.isSurge()) return $persistentStore.write(val, key)
    if (this.isQuanX()) return $prefs.setValueForKey(val, key)
  }
  this.get = (url, callback) => this.send(url, 'GET', callback)
  this.wait = (min, max = min) => (resove) => setTimeout(() => resove(), Math.floor(Math.random() * (max - min + 1) + min))
  this.post = (url, callback) => this.send(url, 'POST', callback)
  this.send = (url, method, callback) => {
    if (this.isSurge()) {
      const __send = method == 'POST' ? $httpClient.post : $httpClient.get
      __send(url, (error, response, data) => {
        if (response) {
          response.body = data
          response.statusCode = response.status
        }
        callback(error, response, data)
      })
    }
    if (this.isQuanX()) {
      url.method = method
      $task.fetch(url).then(
        (response) => {
          response.status = response.statusCode
          callback(null, response, response.body)
        },
        (reason) => callback(reason.error, reason, reason)
      )
    }
  }
  this.done = (value = {}) => $done(value)
}
=======
function Env(name, opts) {
  return new (class {
    constructor(name, opts) {
      this.name = name
      this.data = null
      this.dataFile = 'box.dat'
      this.logs = []
      this.logSeparator = '\n'
      this.startTime = new Date().getTime()
      Object.assign(this, opts)
      this.log('', `🔔${this.name}, 开始!`)
    }

    isNode() {
      return 'undefined' !== typeof module && !!module.exports
    }

    isQuanX() {
      return 'undefined' !== typeof $task
    }

    isSurge() {
      return 'undefined' !== typeof $httpClient && 'undefined' === typeof $loon
    }

    isLoon() {
      return 'undefined' !== typeof $loon
    }

    getScript(url) {
      return new Promise((resolve) => {
        $.get({ url }, (err, resp, body) => resolve(body))
      })
    }

    runScript(script) {
      return new Promise((resolve) => {
        const httpapi = this.getdata('@chavy_boxjs_userCfgs.httpapi')
        console.log(httpapi)
        const [key, addr] = httpapi.split('@')
        const opts = {
          url: `http://${addr}/v1/scripting/evaluate`,
          body: { script_text: script, mock_type: 'cron', timeout: 5 },
          headers: { 'X-Key': key, 'Accept': '*/*' }
        }
        $.post(opts, (err, resp, body) => resolve(body))
      })
    }
    loaddata() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require('fs')
        this.path = this.path ? this.path : require('path')
        const curDirDataFilePath = this.path.resolve(this.dataFile)
        const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
        const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
        const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
        if (isCurDirDataFile || isRootDirDataFile) {
          const datPath = isCurDirDataFile ? curDirDataFilePath : rootDirDataFilePath
          try {
            return JSON.parse(this.fs.readFileSync(datPath))
          } catch (e) {
            return {}
          }
        } else return {}
      } else return {}
    }

    writedata() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require('fs')
        this.path = this.path ? this.path : require('path')
        const curDirDataFilePath = this.path.resolve(this.dataFile)
        const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
        const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
        const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
        const jsondata = JSON.stringify(this.data)
        if (isCurDirDataFile) {
          this.fs.writeFileSync(curDirDataFilePath, jsondata)
        } else if (isRootDirDataFile) {
          this.fs.writeFileSync(rootDirDataFilePath, jsondata)
        } else {
          this.fs.writeFileSync(curDirDataFilePath, jsondata)
        }
      }
    }

    lodash_get(source, path, defaultValue = undefined) {
      const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.')
      let result = source
      for (const p of paths) {
        result = Object(result)[p]
        if (result === undefined) {
          return defaultValue
        }
      }
      return result
    }

    lodash_set(obj, path, value) {
      if (Object(obj) !== obj) return obj
      if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []
      path.slice(0, -1).reduce((a, c, i) => (Object(a[c]) === a[c] ? a[c] : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {})), obj)[path[path.length - 1]] = value
      return obj
    }

    getdata(key) {
      let val = this.getval(key)
      // 如果以 @
      if (/^@/.test(key)) {
        const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
        const objval = objkey ? this.getval(objkey) : ''
        if (objval) {
          try {
            const objedval = JSON.parse(objval)
            val = objedval ? this.lodash_get(objedval, paths, '') : val
          } catch (e) {
            val = ''
          }
        }
      }
      return val
    }

    setdata(val, key) {
      let issuc = false
      if (/^@/.test(key)) {
        const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
        const objdat = this.getval(objkey)
        const objval = objkey ? (objdat === 'null' ? null : objdat || '{}') : '{}'
        try {
          const objedval = JSON.parse(objval)
          this.lodash_set(objedval, paths, val)
          issuc = this.setval(JSON.stringify(objedval), objkey)
          console.log(`${objkey}: ${JSON.stringify(objedval)}`)
        } catch (e) {
          const objedval = {}
          this.lodash_set(objedval, paths, val)
          issuc = this.setval(JSON.stringify(objedval), objkey)
          console.log(`${objkey}: ${JSON.stringify(objedval)}`)
        }
      } else {
        issuc = $.setval(val, key)
      }
      return issuc
    }

    getval(key) {
      if (this.isSurge() || this.isLoon()) {
        return $persistentStore.read(key)
      } else if (this.isQuanX()) {
        return $prefs.valueForKey(key)
      } else if (this.isNode()) {
        this.data = this.loaddata()
        return this.data[key]
      } else {
        return (this.data && this.data[key]) || null
      }
    }

    setval(val, key) {
      if (this.isSurge() || this.isLoon()) {
        return $persistentStore.write(val, key)
      } else if (this.isQuanX()) {
        return $prefs.setValueForKey(val, key)
      } else if (this.isNode()) {
        this.data = this.loaddata()
        this.data[key] = val
        this.writedata()
        return true
      } else {
        return (this.data && this.data[key]) || null
      }
    }

    initGotEnv(opts) {
      this.got = this.got ? this.got : require('got')
      this.cktough = this.cktough ? this.cktough : require('tough-cookie')
      this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()
      if (opts) {
        opts.headers = opts.headers ? opts.headers : {}
        if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
          opts.cookieJar = this.ckjar
        }
      }
    }

    get(opts, callback = () => {}) {
      if (opts.headers) {
        delete opts.headers['Content-Type']
        delete opts.headers['Content-Length']
      }
      if (this.isSurge() || this.isLoon()) {
        $httpClient.get(opts, (err, resp, body) => {
          if (!err && resp) {
            resp.body = body
            resp.statusCode = resp.status
            callback(err, resp, body)
          }
        })
      } else if (this.isQuanX()) {
        $task.fetch(opts).then(
          (resp) => {
            const { statusCode: status, statusCode, headers, body } = resp
            callback(null, { status, statusCode, headers, body }, body)
          },
          (err) => callback(err)
        )
      } else if (this.isNode()) {
        this.initGotEnv(opts)
        this.got(opts)
          .on('redirect', (resp, nextOpts) => {
            try {
              const ck = resp.headers['set-cookie'].map(this.cktough.Cookie.parse).toString()
              this.ckjar.setCookieSync(ck, null)
              nextOpts.cookieJar = this.ckjar
            } catch (e) {
              this.logErr(e)
            }
            // this.ckjar.setCookieSync(resp.headers['set-cookie'].map(Cookie.parse).toString())
          })
          .then(
            (resp) => {
              const { statusCode: status, statusCode, headers, body } = resp
              callback(null, { status, statusCode, headers, body }, body)
            },
            (err) => callback(err)
          )
      }
    }

    post(opts, callback = () => {}) {
      // 如果指定了请求体, 但没指定`Content-Type`, 则自动生成
      if (opts.body && opts.headers && !opts.headers['Content-Type']) {
        opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      }
      delete opts.headers['Content-Length']
      if (this.isSurge() || this.isLoon()) {
        $httpClient.post(opts, (err, resp, body) => {
          if (!err && resp) {
            resp.body = body
            resp.statusCode = resp.status
          }
          callback(err, resp, body)
        })
      } else if (this.isQuanX()) {
        opts.method = 'POST'
        $task.fetch(opts).then(
          (resp) => {
            const { statusCode: status, statusCode, headers, body } = resp
            callback(null, { status, statusCode, headers, body }, body)
          },
          (err) => callback(err)
        )
      } else if (this.isNode()) {
        this.initGotEnv(opts)
        const { url, ..._opts } = opts
        this.got.post(url, _opts).then(
          (resp) => {
            const { statusCode: status, statusCode, headers, body } = resp
            callback(null, { status, statusCode, headers, body }, body)
          },
          (err) => callback(err)
        )
      }
    }
    /**
     * 
     * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S')
     *    :$.time('yyyyMMddHHmmssS')
     *    y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒 
     *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
     * @param {*} fmt 格式化参数
     * 
     */
    time(fmt) {
      let o = {
          "M+": new Date().getMonth() + 1,
          "d+": new Date().getDate(),
          "H+": new Date().getHours(),
          "m+": new Date().getMinutes(),
          "s+": new Date().getSeconds(),
          "q+": Math.floor((new Date().getMonth() + 3) / 3),
          "S": new Date().getMilliseconds()
      }
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (new Date().getFullYear() + "").substr(4 - RegExp.$1.length))
      for (let k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
      return fmt
  }  

    /**
     * 系统通知
     *
     * > 通知参数: 同时支持 QuanX 和 Loon 两种格式, EnvJs根据运行环境自动转换, Surge 环境不支持多媒体通知
     *
     * 示例:
     * $.msg(title, subt, desc, 'twitter://')
     * $.msg(title, subt, desc, { 'open-url': 'twitter://', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
     * $.msg(title, subt, desc, { 'open-url': 'https://bing.com', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
     *
     * @param {*} title 标题
     * @param {*} subt 副标题
     * @param {*} desc 通知详情
     * @param {*} opts 通知参数
     *
     */
    msg(title = name, subt = '', desc = '', opts) {
      const toEnvOpts = (rawopts) => {
        if (!rawopts || (!this.isLoon() && this.isSurge())) return rawopts
        if (typeof rawopts === 'string') {
          if (this.isLoon()) return rawopts
          else if (this.isQuanX()) return { 'open-url': rawopts }
          else return undefined
        } else if (typeof rawopts === 'object' && (rawopts['open-url'] || rawopts['media-url'])) {
          if (this.isLoon()) return rawopts['open-url']
          else if (this.isQuanX()) return rawopts
          else undefined
        } else {
          return undefined
        }
      }
      if (this.isSurge() || this.isLoon()) {
        $notification.post(title, subt, desc, toEnvOpts(opts))
      } else if (this.isQuanX()) {
        $notify(title, subt, desc, toEnvOpts(opts))
      }
      this.logs.push('', '==============📣系统通知📣==============')
      this.logs.push(title)
      subt ? this.logs.push(subt) : ''
      desc ? this.logs.push(desc) : ''
    }

    log(...logs) {
      if (logs.length > 0) {
        this.logs = [...this.logs, ...logs]
      } else {
        console.log(this.logs.join(this.logSeparator))
      }
    }

    logErr(err, msg) {
      const isPrintSack = !this.isSurge() && !this.isQuanX() && !this.isLoon()
      if (!isPrintSack) {
        $.log('', `❗️${this.name}, 错误!`, err.message)
      } else {
        $.log('', `❗️${this.name}, 错误!`, err.stack)
      }
    }

    wait(time) {
      return new Promise((resolve) => setTimeout(resolve, time))
    }

    done(val = {}) {
      const endTime = new Date().getTime()
      const costTime = (endTime - this.startTime) / 1000
      this.log('', `🔔${this.name}, 结束! 🕛 ${costTime} 秒`)
      this.log()
      if (this.isSurge() || this.isQuanX() || this.isLoon()) {
        $done(val)
      }
    }
  })(name, opts)
}
>>>>>>> fa3f46d0488431062ffb5704e81af6480a439cc0
