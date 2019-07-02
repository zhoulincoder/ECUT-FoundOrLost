

## 写在前面

为什么要做这个小程序？因为，截至本文发表，我和那位捡到我校园卡的女生在一起840天了，在此，希望各位小伙伴把这个项目拿走，不仅能够增强自己对小程序实战能力，也能早日找到自己所属的女孩。

**提醒：本文主要聊聊该项目的云开发技术点和js逻辑，IM即时通讯之后会写。通过本文你将学习微信小程序云函数的使用、组件间通信的各种方法、根据功能需求设计js逻辑、promise相关用法、页面分页加载等**

## 完整效果展示

## 项目分析

- 本校内已有三个失物招领QQ群，每个群1900+人(包括重复加群)，上课期间，每天每个群的信息数99+(包括重复发、图片文字分开发等)。另外，据管理员称，群内虽然少有闲话，但失物的找回率不高，很多同学不知道有信息公告或者因为信息太多而错过了。
- 微信上可搜索到的失物招领小程序有不少，考虑到用户的心理，好心人和失主之间的联系功能，很多平台都是直接展示联系方式，即使有通过学号登录才可查看信息，那也是对用户信息的不负责。
- 基于上述分析，这款小程序的**需求：有分类，能搜索，快速发布，即时联系**，不用加一堆的群，也不担心错过了信息。明确了需求，我们才能更好的设计代码逻辑，下面开始！

## 发布功能（本地代码）

### 思路分析

- 功能：发表前提醒授权；表单为空不可提交；能多选图片并上传相关内容。
- 困难点：使用<code style="color:#ff502c">promise.all</code>实现先上传图片，拿到图片的云路径后，再将用户输入的发布信息全部上传。
- 实现：
  - 点击"立即发布"按钮后，调用组件<code style="color:#ff502c">inputDetail</code>中的方法<code style="color:#ff502c">checkUploadForm</code>(带参数`releaseType`，方便后面上传数据是添加到失物招领的`found`集合还是寻物启事的`lost`集合)，表单内容不为空开始上传；
  - 对上传图片的缓存路径执行<code style="color:#ff502c">forEach</code>，将每张图片的缓存路径传递给<code style="color:#ff502c">promise</code>函数<code style="color:#ff502c">promiseUplodImg</code>（函数`resolve`上传完成后每张图片的云路径）上传图片；
  - 同时将每张图片执行的该函数<code style="color:#ff502c">push</code>进一个数组中，再执行<code style="color:#ff502c">promise.all</code>(该方法接收一个每一项都是promise函数的数组)；
  - 最后，通过<code style="color:#ff502c">.then</code>（接收一个数组，包含所有图片的云路径）将用户输入的信息上传。

### 代码实现

```javascript
// miniprogram/pages/release/release.js
data: {
    clickStatus: 0,
    releaseTypes: ['found', 'lost'],
  }
//立即发布按钮上绑定该方法
checkUploadForm: function () {
    let that = this
    this.setData({
      isUpload: true
    })    // 声明上传状态
    this.inputDetail = this.selectComponent('#inputDetail')
    this.inputDetail.checkUploadForm(that.data.releaseTypes[that.data.clickStatus])
//调用组件inputDetail上的checkUploadForm方法，传参found || lost
}
```

```javascript
// // components/inputDetail/inputDetail.js
checkUploadForm(releaseType) {
  //releaseType 根据参数确定发布的类型是失物招领还是寻物启事
    let that = this
    let promises = []
    if (that.data.releaseText && that.data.thingsType) {
        that.setData({
            releaseType,
        })
        if (that.data.imgLocalPath.length > 0) {
          wx.showLoading({
            title: '正在发布...'
          });

          that.data.imgLocalPath.forEach(element => {
            promises.push(that.promiseUplodImg(element))
          })
          // 遍历缓存图片路径，将多个promise函数放入数组promises中
          // 拿到所有图片的云路径
          Promise.all(promises)
            .then((imgCloudPath) => {
              console.log(imgCloudPath);
              that.uploadRelease(imgCloudPath)
            })
            .catch((err) => { console.log(err); })

        } else {
          //用户没有选择图片，则直接上传发布信息
          that.uploadRelease()
        }
      } else {
        wx.showToast({
          title: '内容或分类为空',
          image: '../../asserts/icons/my_icon_still@2x.png',
          duration: 1800
        })
      }
    },
    promiseUplodImg(element) {
      return new Promise((resolve, reject) => {
        //一次只能上传一张图片到数据库
        const filePath = element;
        let a = filePath.lastIndexOf('.');
        let b = filePath.lastIndexOf('.', a - 1);
        let c = filePath.substring(b + 1, a);
        const cloudPath = c + filePath.match(/\.[^.]+?$/);
        wx.cloud.uploadFile({
          filePath,
          cloudPath,
          success: (res) => {
            console.log('上传成功', res)
            resolve(res.fileID)
            //每张图片的云路径
          },
          fail: (err) => {
            console.log('上传失败', err)
          }
        });
      })
    },
    uploadRelease(imgCloudPath) {
      let that = this
      wx.cloud.callFunction({
        name: "uploadInput",
        data: {
          releaseType: that.data.releaseType,
          releaseImg: imgCloudPath,
          releaseText: that.data.releaseText,
          thingsType: that.data.thingsType,
          releaseCall: that.data.releaseCall,
          releaseRemind: that.data.releaseRemind,
          //用户输入的全部信息
        },
        success: () => {
          wx.hideLoading();
          const releaseType = that.data.releaseType
          wx.switchTab({
            url: `/pages/${releaseType}/${releaseType}`
          })
          // 跳转到发布类型对应的页面
          wx.hideNavigationBarLoading()
        },
        fail: (err) => {
          console.log(err);
        },
        complete: () => {
          that.setData({
            releaseText: '',
            imgLocalPath: [],
            thingsType: '',
            releaseCall: '',
            releaseRemind: false,
            releaseType: 'found',
            typeIndex: 0,
          })
        }
      })
    },
```

## 发布功能（云函数）

### 思路分析

- 功能：调用云函数，将发布内容上传。
- 实现： 使用<code style="color:#ff502c">promise</code>先将发布的信息上传至对应的集合，再将发布记录的<code style="color:#ff502c">id</code>和发布者的<code style="color:#ff502c">openId</code>上传至集合<code style="color:#ff502c">user-release</code>。这样存储便于后面读取数据渲染界面，每一条发布记录的<code style="color:#ff502c">id</code>通过<code style="color:#ff502c">user-release</code>集合与发布者信息绑定在一起。(id是云开发数据库中给每条记录自动生成的_id)

### 数据库记录示例


![](https://user-gold-cdn.xitu.io/2019/7/2/16bb023c2d8de24a?w=602&h=324&f=png&s=30024)
![](https://user-gold-cdn.xitu.io/2019/7/2/16bb0223c62dcda1?w=378&h=167&f=png&s=13269)

### 代码实现

```javascript
// 云函数uploadInput
const getTime = function () {
    return new Promise((resolve, reject) => {
      var now = new Date();
      var month = now.getMonth() + 1;    
      var day = now.getDate();           
      var hour = now.getHours() + 8;      //没加8被坑
      var minute = now.getMinutes();          
      var time = ''
      if (month < 10) time += "0";
      time += month + "-";
      if (day < 10) time += "0";
      time += day + " ";
      if (hour < 10) time += "0";
      time += hour + ":";
      if (minute < 10) time += '0';
      time += minute;
      resolve(time)      
    })
  }
exports.main = async (event, context) => {
  const userInfo = event.userInfo
  const createTime = await getTime()
  return await db.collection(event.releaseType).add({
    data: {
      releaseType: event.releaseType,
      releaseImg: event.releaseImg,
      releaseText: event.releaseText,
      thingsType: event.thingsType,
      releaseCall: event.releaseCall,
      releaseRemind: event.releaseRemind,
      createBy: userInfo.openId,
      createTime: createTime,
      deleted: false
    }
  })
    .then(res => {
      return db.collection('user-release').add({
        data: {
          releaseId: res._id,
          userId: userInfo.openId,
          deleted: false,
        }
      })
    })
}
```

### 效果展示

![](https://user-gold-cdn.xitu.io/2019/7/2/16bb025d643d19c8?w=324&h=570&f=gif&s=4055420)


## 加载发布的信息（本地代码）

### 思路分析

- 功能：在“全部”页加载全部信息，点击类别加载不同类的信息。
- 实现：
  - 在当前页面调用云函数<code style="color:#ff502c">getRelease</code>，并将获取到的页面数据存入一个中间变量<code style="color:#ff502c">middleArr</code>(这样便于做分页/分类加载)；
  - 然后调用函数<code style="color:#ff502c">showPage</code>判断当前点击的类别，从<code style="color:#ff502c">middleArr</code>中筛选出与点击类别匹配的数据，并将数据放入<code style="color:#ff502c">releaseIndo</code>传给组件<code style="color:#ff502c">infoCard</code>来展示用户发布的信息。

### 代码实现

```html
// components/infoCard/infoCard.js
// 获取到的数据传入组件进行渲染
  properties: {
    releaseInfo: {
      type: Array,
      value: []
  }
<!--components/infoCard/infoCard.wxml -->
<block wx:for="{{releaseInfo}}" wx:key="index" wx:for-item="releaseItem"> </block>
```

```html
<!--miniprogram/pages/found/found.wxml 发布信息展示页-->
<view class="navbar">
  <scroll-view scroll-x="{{true}}">
    <category tabs="{{['全部','证件','书籍文具','电子设备','生活用品','其他']}}" catch:onTitleChange="onTitleChange"></category>
  </scroll-view>
</view>
<view class="foundContent">
  <view class="inforCards">
    <infocard id="infoCard" class="infoCard" releaseInfo="{{releaseInfo}}"></infocard>
  </view>
</view>
```

```javascript
// miniprogram/pages/found/found.js
data: {
    tabbarText: 'found',
    releaseInfo: [],  // 传递给组件的数据
    typeTitle: ['all', 'card', 'booktool', 'electroic', 'lifetool', 'others'],
    thingsType: 'all', //默认点击的是‘全部’类
    middleArr: [],
  },
  onTitleChange(e) {
    //判断用户点击的类别
    this.setData({
      thingsType: this.data.typeTitle[e.detail]
    })
    this.showPage()
  },
onShow: function () {
	//加载页面，调用云函数
    let that = this
    wx.showNavigationBarLoading();
    wx.cloud.callFunction({
      name: 'getRelease',
      data: {
        tabbarText: that.data.tabbarText,
        //根据点击的tabbar=失物招领或寻物启事，获取不同集合中的数据
      },
      success: res => {
        that.setData({
          middleArr: res.result,
          //成功返回的数据放入中间变量
        })
        that.showPage()
      },
      fail: (err) => {
        console.log(err)
      },
      complete: () => {
        wx.hideNavigationBarLoading()
      }
    })
  },
   showPage() {
    let that = this
    if (that.data.thingsType == 'all') {
 //如果点击的是‘全部’，则直接将中间变量中的数据传给releaseInfo，组件获取数据进行渲染
      that.setData({
        releaseInfo: that.data.middleArr
      })
    } else {
      let newArr = []
      const val = that.data.thingsType
      //否则遍历中间变量中的数据，将满足条件的数据传给组件
      that.data.middleArr.forEach(item => {
        if( item.thingsType == val){
          newArr.push(item)
        }
      })
      that.setData({
        releaseInfo: newArr
      })
    }
  },
```

## 加载发布的信息（云函数）

### 思路分析

- 调用云函数<code style="color:#ff502c">getRelease</code>，在集合<code style="color:#ff502c">user-release</code>中**筛选**出未删除数据（得到一个数组，数组每一项都是一个对象，每个对象中包含每一发布信息的`releaseId`和与之对应的发布者`openId`)；
- 然后遍历数组的每个对象的<code style="color:#ff502c">releaseId</code>字段，根据该字段上的内容和未删除<code style="color:#ff502c">deleted:false</code>在集合<code style="color:#ff502c">found || lost</code>中**筛选**出对应失物招领或寻物启事的发布信息；
- 在遍历过程中，还要根据每条发布信息上的<code style="color:#ff502c">createBy</code>字段，在集合<code style="color:#ff502c">goodUser</code>中**筛选**出对应的发布者信息，并将每条发布者信息放入发布信息的<code style="color:#ff502c">createBy</code>中；
- 最后，将每条已经存入发布者信息的发布信息<code style="color:#ff502c">unshift</code>进入数组<code style="color:#ff502c">returnResult</code>中（保证将最新的发布信息渲染在最前面），返回<code style="color:#ff502c">returnResult</code>。

### 数据库记录示例

![](https://user-gold-cdn.xitu.io/2019/7/2/16bb028422bf400f?w=384&h=135&f=png&s=12198)

![](https://user-gold-cdn.xitu.io/2019/7/2/16bb02987eef226b?w=624&h=337&f=png&s=29587)

![](https://user-gold-cdn.xitu.io/2019/7/2/16bb02b267c3e474?w=637&h=184&f=png&s=20516)

![](https://user-gold-cdn.xitu.io/2019/7/2/16bb02c51095f1ac?w=706&h=320&f=png&s=61577)
### 代码实现

```javascript
// 云函数getRelease
exports.main = async (event, context) => {
  let releaseList = await db.collection('user-release')
    .where({
      deleted: false
    })
    .get()
  let returnResult = []
  for (let item of newReleaseList) {
    const oneRelease = await db.collection(event.tabbarText)
    // 调用云函数传入 event.tabbarText=found||lost
    // 在found || lost 集合中获取数据
      .where({
        _id: item.releaseId,
        deleted: false
      })
      .get()
    // 经过上面的代码筛选，newReleaseList中可能存在空项
    // 可以直接返回returnResult.push(oneRelease.data)进行查看理解 
    if (oneRelease.data.length > 0) {
      const userInfo = await db.collection('goodUser')
        .where({
          openId: oneRelease.data[0].createBy
        })
        .get()
      oneRelease.data[0].createBy = userInfo.data[0];
      returnResult.unshift(oneRelease.data[0])
    }
  }
  return returnResult
}
```

### 效果展示

![](https://user-gold-cdn.xitu.io/2019/7/2/16bb02e723014403?w=324&h=570&f=gif&s=4055420)


## 分页加载

### 思路分析

- 设置每次获取4条发布信息、默认当前页为1，当用户下拉触底时，执行<code style="color:#ff502c">onShow</code>；
- 调用云函数<code style="color:#ff502c">getRelease</code>再次请求数据，将返回的数据传递给组件渲染；
- **在云函数<code style="color:#ff502c">getRelease</code>中，将获取的数组使用<code style="color:#ff502c">slice</code>方法，<code style="color:#ff502c">slice</code>接受的参数为：- (当前页 * 每次获取数） ，用参数<code style="color:#ff502c">newRelease</code>接收该方法返回的新数组。新数组中将是最新的（当前页 * 每次获取数）条发布信息。**

### 代码实现

```javascript
// miniprogram/pages/found/found.js
onReachBottom: function () {
    this.setData({
      currentPage: this.data.currentPage + 1
    })
    console.log(this.data.currentPage);
    this.onShow()
  },
wx.cloud.callFunction({
      name: 'getRelease',
      data: {
        tabbarText: that.data.tabbarText,
        currentPage: that.data.currentPage
      },
  ......
```

```javascript
// 云函数 getRelease
let releaseList = await db.collection('user-release')
    .where({
      deleted: false
    })
    .get()
  const currentPage = event.currentPage
  const releaseSize = 4
  const sliceRelease = releaseSize  * currentPage
  const newReleaseList = releaseList.data.slice(-sliceRelease)
  // 在这里插入实现分页加载
  let returnResult = []
  for (let item of newReleaseList) {
    const oneRelease = await db.collection(event.tabbarText)
      .where({
........
```

### 效果展示

![](https://user-gold-cdn.xitu.io/2019/7/2/16bb02fdd9951480?w=324&h=570&f=gif&s=4926411)

## 技术总结
- 组件间的通信除了可以使用<code>properties</code>，也可以尝试<code>selectComponent</code>来调用组件上的方法，将数据传过去。
- 在实际项目中，总会遇到很多需要按步骤执行的函数，稍不注意，获取的数据就是错的，通过使用promise系列方法可以很好的解决异步问题。
- 在小程序中频繁多次使用setData是非常消耗性能的，在设计js逻辑、构建函数、设置变量的时候要多加考虑项目功能前后的联系，从而保证代码严谨并且减小资源消耗。
- 云开发可以很好的帮助我们同时完成前后端的配置，在开发过程中加深我们对后端数据的理解和运用。