// miniprogram/pages/mine/mine.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    minebd: '../../asserts/icons/my_avatar_bg@2x.png',
    userAvatar: '../../asserts/images/th.jpg',
    nickName: '这是昵称',
    listIcon: [
      '../../asserts/icons/my_icon_lost_n@2x.png',
      '../../asserts/icons/my_icon_message@2x.png',
      '../../asserts/icons/my_icon_manager@2x.png',
      '../../asserts/icons/my_icon_feedback@2x.png'
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  //用户授权
  onWeixinLogin(e) {
    const userInfo = e.detail.userInfo;
    // console.log(e);
    if (userInfo) {
      this.handleLogin();
    } else {
      wx.showToast({
        title: '你拒绝了授权'
      })
    }
  },
  // 拿到他的用户信息，
  handleGetLocalUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: res => {
          console.log(res)
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                console.log('用户 res', res);
                const userInfo = res.userInfo;
                resolve(userInfo);
              }
            })
          }
        }
      })
    })
  },
  handleLogin() {
    let that = this
    wx.showLoading({
      title: '正在登录中...'
    });
    this.handleGetLocalUserInfo()
      .then(userInfo => {
        // step 1 获取code
        wx.login({
          success: (codeRes) => {
            console.log(codeRes)
            if (codeRes.code) {
              const code = codeRes.code;
              //console.log(userInfo, code);
              // step 2 code 给 服务器 换取openid 和 session_key
              wx.cloud.callFunction({
                name: 'getSessionKey',
                data: {
                  code,
                  ...userInfo
                },
                success: res => {
                  // console.log(...userInfo)
                  // console.log('服务', res);
                  console.log('用户信息', userInfo)
                  
                  wx.cloud.callFunction({
                    name: 'createUser',
                    data: {
                      avatarUrl: userInfo.avatarUrl,
                      nickName: userInfo.nickName,
                    },
                    success: res => {
                      // console.log(res);
                      console.log('用户信息', userInfo)
                      app.globalData.avatarUrl = userInfo.avatarUrl
                      app.globalData.nickName = userInfo.nickName
                      app.globalData.isLogin = true
                      that.setData({
                        isLogin: true,
                        nickName: userInfo.nickName,
                        userAvatar: userInfo.avatarUrl
                      })
                      console.log(app.globalData.isLogin );
                      
                      wx.hideLoading()
                      // that.onShow()
                    },
                    fail: err => {
                      console.log(err);
                    },
                    complete: e => {
                      console.log(e);
                    }
                  })
                },
                fail: err => {
                  console.log(err);
                }
              })
            }
          }
        })
      })
  },

  onGetOpenid: function () {
    // // 调用云函数
    // wx.cloud.callFunction({
    //   name: 'login',
    //   data: {},
    //   success: res => {
    //     console.log('[云函数] [login] user openid: ', res.result.openid)
    //     app.globalData.openid = res.result.openid
    //     wx.navigateTo({
    //       url: '../userConsole/userConsole',
    //     })
    //   },
    //   fail: err => {
    //     console.error('[云函数] [login] 调用失败', err)
    //     wx.navigateTo({
    //       url: '../deployFunctions/deployFunctions',
    //     })
    //   }
    // })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})