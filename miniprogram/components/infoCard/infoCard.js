// components/infoCard/infoCard.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    releaseInfo: {
      type: Array,
      value: []
    }
  },


  /**
   * 组件的初始数据
   */
  data: {
    // releaseInfo: [
    //   {
    //     createBy:
    //       {
    //         _id: "281fb4bf5d0f2830068c1ef2197eb3a3",
    //         avatarUrl: "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLibBLcfjwFvt0ak7lZ1aKNYKh0ZZUR7Jh5jqhDLIWYgRp0cDH5jeo4b8COPUN35hx128BwfhCQx8w/132",
    //         createTime: "2019-06-23T07:20:16.252Z",
    //         nickName: "倔强流浪者",
    //         openId: "ocdRK5MjS-hNS3dAnWvJNXpyfCg8"
    //       },
    //     createTime: "2019-06-28T10:53:12.261Z",
    //     deleted: false,
    //     releaseCall: "123",
    //     releaseImg: [
    //       "cloud://lost-found-5gx33.6c6f-lost-found-5gx33-1259213816/6IKbRUny54J5af43e92f3e67a21477ed4cac79908aa0.png", 
    //       "cloud://lost-found-5gx33.6c6f-lost-found-5gx33-1259213816/6IKbRUny54J5af43e92f3e67a21477ed4cac79908aa0.png",
    //       "cloud://lost-found-5gx33.6c6f-lost-found-5gx33-1259213816/6IKbRUny54J5af43e92f3e67a21477ed4cac79908aa0.png",
    //       "cloud://lost-found-5gx33.6c6f-lost-found-5gx33-1259213816/6IKbRUny54J5af43e92f3e67a21477ed4cac79908aa0.png", 
    //       "cloud://lost-found-5gx33.6c6f-lost-found-5gx33-1259213816/6IKbRUny54J5af43e92f3e67a21477ed4cac79908aa0.png",
    //       "cloud://lost-found-5gx33.6c6f-lost-found-5gx33-1259213816/6IKbRUny54J5af43e92f3e67a21477ed4cac79908aa0.png"
    //       ],
    //     releaseRemind: true,
    //     releaseText: "在三教捡到一个手机",
    //     releaseType: "found",
    //     thingsType: "electroic",
    //     _id: "6dfb26295d15f198027264d66e27e049"
    //   },
    // ],
    textExpa: false,
    callIcon: '../../asserts/icons/lostfound_icon_chat_p@2x.png'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    textExpander: function () {
      let self = this;
      if (this.data.textExpa) {
        self.setData({
          textExpa: false
        })
      } else {
        self.setData({
          textExpa: true
        })
      }
    },
    previewImage(e) {
      console.log(e)
      wx.previewImage({
        current: e.currentTarget.id,
        urls: [e.currentTarget.id]
      })
    },
  }
})
