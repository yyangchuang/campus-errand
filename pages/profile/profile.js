const api = require('../../utils/api.js');

Page({
  data: {
    user: null,
    pricing: {},
    isRunner: false,
    incomePeriod: 'week',
    incomeData: null,
    loggedIn: false
  },

  onShow() {
    const app = getApp();
    const loggedIn = app.isLoggedIn();
    this.setData({ loggedIn });
    if (!loggedIn) {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().refresh();
      }
      return;
    }
    const raw = wx.getStorageSync('userInfo') || {};
    const stats = raw.stats || {
      publishCount: 0,
      acceptCount: 0,
      completeCount: 0,
      rating: null
    };
    const user = {
      ...raw,
      nickname: raw.nickname || '微信用户',
      avatar: raw.avatar || '👤',
      phone: raw.phone || '未绑定手机',
      school: raw.school || '未设置学校',
      stats
    };
    const isRunner = user.role === 'runner';

    this.setData({
      user,
      pricing: app.globalData.pricing,
      isRunner
    });

    if (isRunner) {
      this.loadIncome();
    }

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().refresh();
    }
  },

  async loadIncome() {
    try {
      const week = await api.getIncome('week');
      const month = await api.getIncome('month');
      const total = await api.getIncome('total');
      this.setData({
        incomeWeek: week,
        incomeMonth: month,
        incomeTotal: total
      });
      this.switchPeriod('week');
    } catch (e) {
      console.error(e);
    }
  },

  switchPeriod(p) {
    this.setData({ incomePeriod: p });
    const map = { week: this.data.incomeWeek, month: this.data.incomeMonth, total: this.data.incomeTotal };
    this.setData({ incomeData: map[p] });
  },

  switchToRunner() {
    getApp().switchRole('runner');
    wx.showToast({ title: '已切换为跑腿员视角', icon: 'none' });
    wx.switchTab({ url: '/pages/pending/pending' });
  },
  switchToUser() {
    getApp().switchRole('user');
    wx.showToast({ title: '已切换为发单用户视角', icon: 'none' });
    wx.switchTab({ url: '/pages/publish/publish' });
  },
  logout() {
    wx.showModal({
      title: '确定退出登录吗？',
      success: (r) => {
        if (r.confirm) {
          const app = getApp();
          app.logout();
          if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().refresh();
          }
          this.setData({ loggedIn: false });
          wx.showToast({ title: '已退出', icon: 'none' });
        }
      }
    });
  },

  editProfile() {
    wx.showToast({ title: '编辑资料开发中', icon: 'none' });
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  }
});
