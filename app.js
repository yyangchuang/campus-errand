const api = require('./utils/api.js');

App({
  globalData: {
    currentUser: null,
    pricing: {
      small: 3,
      mid: 5,
      big: 10,
      urgent: 15
    },
    expressList: ['顺丰', '京东', '圆通', '中通', '申通', '韵达', '百世', '极兔', '邮政EMS']
  },

  onLaunch() {
    const user = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    if (user && token) {
      this.globalData.currentUser = user;
    }
  },

  async loginAs(openid) {
    try {
      const resp = await api.devLogin(openid);
      api.saveToken(resp.token);
      wx.setStorageSync('userInfo', resp.userInfo);
      this.globalData.currentUser = resp.userInfo;
      return resp.userInfo;
    } catch (e) {
      wx.showToast({ title: '登录失败', icon: 'none' });
      throw e;
    }
  },

  switchRole(openid) {
    return this.loginAs(openid).then(() => {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().refresh();
      }
    });
  },

  logout() {
    api.clearToken();
    wx.removeStorageSync('userInfo');
    this.globalData.currentUser = null;
  },

  requireLogin() {
    const token = wx.getStorageSync('token');
    if (!this.globalData.currentUser || !token) {
      wx.showModal({
        title: '需要登录',
        content: '登录后才能使用该功能',
        confirmText: '立即登录',
        cancelText: '稍后再说',
        confirmColor: '#ff6b35',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' });
          }
        }
      });
      return false;
    }
    return true;
  },

  isLoggedIn() {
    const token = wx.getStorageSync('token');
    return !!(this.globalData.currentUser && token);
  }
});
