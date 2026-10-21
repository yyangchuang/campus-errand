const { ICONS } = require("../../utils/icons.js");
const api = require('../../utils/api.js');

Page({
  data: {
    icons: ICONS,
    user: null,
    pricing: {},
    stats: {
      publishCount: 0,
      acceptCount: 0,
      completeCount: 0,
      totalEarn: 0
    },
    incomePeriod: 'week',
    incomeAmount: 0,
    incomeCount: 0,
    incomeWeek: null,
    incomeMonth: null,
    incomeTotal: null,
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
    const rawStats = raw.stats || { publishCount: 0, acceptCount: 0, completeCount: 0, totalEarn: 0 };
    const user = {
      ...raw,
      nickname: raw.nickname || '微信用户',
      avatar: '',
      phone: raw.phone || '未绑定手机',
      school: raw.school || '未设置学校'
    };

    this.setData({
      user,
      pricing: app.globalData.pricing || {},
      stats: rawStats
    });

    if (user.role === 'runner') {
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

  changePeriod(e) {
    const period = e.currentTarget.dataset.period;
    this.switchPeriod(period);
  },

  switchPeriod(p) {
    const map = { week: this.data.incomeWeek, month: this.data.incomeMonth, total: this.data.incomeTotal };
    const data = map[p] || { amount: 0, count: 0 };
    this.setData({
      incomePeriod: p,
      incomeAmount: data.amount || 0,
      incomeCount: data.count || 0
    });
  },

  switchRole(e) {
    const role = e.currentTarget.dataset.role;
    const app = getApp();
    app.switchRole(role);
    wx.showToast({ title: role === 'runner' ? '已切换为跑腿员' : '已切换为发单用户', icon: 'none' });
    wx.switchTab({ url: role === 'runner' ? '/pages/pending/pending' : '/pages/publish/publish' });
  },

  logout() {
    wx.showModal({
      title: '确定退出登录吗？',
      success: (r) => {
        if (r.confirm) {
          getApp().logout();
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

  goLegal() {
    wx.showToast({ title: '服务协议开发中', icon: 'none' });
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  }
});
