/* eslint-disable */
;(function(win) {
  var ua = navigator.userAgent

  function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    var r = window.location.search.substr(1).match(reg)
    if (r !== null) return unescape(r[2])
    return null
  }

  function isAndroid() {
    return win.hxAndroidBridge !== undefined
  }

  function isIOS() {
    return win.hxiOSBridge !== undefined
  }

  function isFcMini() {
    return (
      win.__fcjs_environment &&
      win.__fcjs_environment.toLocaleLowerCase() === 'miniprogram'
    )
  }

  function isWeChatMini() {
    return (
      window.__wxjs_environment === 'miniprogram' ||
      /miniProgram/i.test(navigator.userAgent.toLowerCase())
    )
  }

  var messageHandlers = {}

  var mobile = {
    /**
     *通过bridge调用app端的方法(异步)
     * @param method
     * @param params
     * @param callback function(errno, errmsg, result)函数
     */
      postNotification: function(name, params, callback) {
        // 生成回调函数方法名称
        var cbName = 'CB_' + Date.now() + '_' + Math.ceil(Math.random() * 10)
        // 挂载一个临时函数到window变量上，方便app回调
        win[cbName] = function(errno, errmsg, result) {
          console.log('result', result)
          // var resultObj;F
          // if (typeof(result) !== 'undefined' && result !== null) {
          //     resultObj = JSON.parse(result);
          // }
          // console.log('resultObj', resultObj)
          callback(errno, errmsg, result)
          // 回调成功之后删除挂载到window上的临时函数
          delete win[cbName]
        }
        win.hxAndroidBridge.handleNotification(
          name,
          JSON.stringify(params),
          cbName
        )
    },
    /**
     *通过bridge来handler app端调用的方法
     * @param name
     * @param handler function(name, params)函数
     */
    registerHandler: function(name, handler) {
      if (isFcMini()) {
        // 凡泰小程序
        win.FinChatJSBridge.subscribeHandler(name, handler)
        return false
      }
      if (!messageHandlers[name]) {
        messageHandlers[name] = []
      }
      messageHandlers[name].push(handler)
      // console.info(messageHandlers, 'messageHandlers')
    },
    /**
     *私有方法，只会在native端调用
     */
    handleNotification: function(name, params) {
      var handler = messageHandlers[name]
      if (handler != null) {
        for (var i = 0; i < handler.length; i++) {
          handler[i](name, params)
        }
      } else {
        // alert("no handler!");
      }
    },
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    isFcMini: isFcMini()
  }

  mobile.postNotification('initPage', {}, pageId => (global.pageId = pageId))

  // 将mobile对象挂载到window全局
  win.hxWebBridge = mobile
  
})(window)