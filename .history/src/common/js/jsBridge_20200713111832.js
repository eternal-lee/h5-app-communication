let isAndroid = navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1
let isiOS = !!navigator.userAgent.match(/\(i[^]+( U)? CPU.+Mac OS X/)
let WebViewJavascriptBridge
// 这是必须要写的，用来创建一些设置
function setupWebViewJavascriptBridge (callback) { if (window.WebViewJavascriptBridge) { return callback(window.WebViewJavascriptBridge) } if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback) } window.WVJBCallbacks = [callback] let WVJBIframe = document.createElement('iframe') WVJBIframe.style.display = 'none' WVJBIframe.src = 'https://__bridge_loaded__' document.documentElement.appendChild(WVJBIframe) setTimeout(() => { document.documentElement.removeChild(WVJBIframe) }, 0)}export default { callhandler (name, data, callback) { setupWebViewJavascriptBridge(function (bridge) { bridge.callHandler(name, data, callback) }) }, registerhandler (name, callback) { setupWebViewJavascriptBridge(function (bridge) { bridge.registerHandler(name, function (data, responseCallback) { callback(data, responseCallback) }) }) }}

setupWebViewJavascriptBridge(function (bridge) {
  if (isAndroid) {
    // 初始化
    bridge.init(function (message, responseCallback) {
      var data = {
        'Javascript Responds': 'Wee!'
      }
      responseCallback(data)
    })
  }
})

export default {
  // js调APP方法 （参数分别为:app提供的方法名  传给app的数据  回调）
  postNotification (name, data, callback) {
    setupWebViewJavascriptBridge(function (bridge) {
      bridge.callHandler(name, data, callback)
    })
  },
  // APP调js方法 （参数分别为:js提供的方法名  回调）
  registerHandler (name, callback) {
    setupWebViewJavascriptBridge(function (bridge) {
      bridge.registerHandler(name, function (data, responseCallback) {
        callback(data, responseCallback)
      })
    })
  }
}
