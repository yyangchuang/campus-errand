const { ICONS } = require("../../utils/icons.js");
const api = require('../../utils/api.js');

Page({
  data: {
    icons: ICONS, assignList: [], grabList: [], loggedIn: false },
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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().refresh();
    }
    this.loadList();
  },
  async loadList() {
    try {
      const list = await api.getPending();
      const now = Date.now();
      const assignList = list.filter(o => o.takeMode === 'assign');
      const grabList = list.filter(o => !o.takeMode || o.takeMode === 'grab');
      this.setData({
        assignList: assignList.map(o => this.enrichOrder(o, now)),
        grabList: grabList.map(o => this.enrichOrder(o, now))
      });
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().refresh();
      }
    } catch (e) {
      console.error(e);
    }
  },
  enrichOrder(o, now) {
    const diff = now - o.createdAt;
    const m = Math.floor(diff / 60000);
    let timeLabel = '刚刚';
    if (m >= 60) timeLabel = Math.floor(m / 60) + '小时前';
    else if (m >= 1) timeLabel = m + '分钟前';

    const packages = o.packages || [];
    const pkgCount = packages.length;
    return {
      ...o,
      pkgCount,
      pkgTags: packages.map(p => ({
        text: p.ptype === 'small' ? '小' : p.ptype === 'mid' ? '中' : p.ptype === 'big' ? '大' : '急',
        cls: 'ptype-' + p.ptype,
        price: p.price
      })),
      firstCode: packages[0] ? packages[0].code : '',
      timeLabel
    };
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  },
  async grabOrder(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await api.acceptOrder(id);
      wx.showToast({ title: '抢单成功！', icon: 'success' });
      this.loadList();
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
      }, 800);
    } catch (e) {
      console.error(e);
      if (e && e.code !== 401) {
        wx.showToast({ title: (e && e.msg) || '抢单失败', icon: 'none' });
      }
    }
  },
  async acceptAssign(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await api.acceptOrder(id);
      wx.showToast({ title: '已接受派单', icon: 'success' });
      this.loadList();
    } catch (err) {
      if (err && err.code !== 401) {
        wx.showToast({ title: err.msg || '操作失败', icon: 'none' });
      }
    }
  },
  async rejectAssign(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await api.cancelOrder(id);
      wx.showToast({ title: '已拒绝', icon: 'none' });
      this.loadList();
    } catch (err) {
      if (err && err.code !== 401) {
        wx.showToast({ title: err.msg || '操作失败', icon: 'none' });
      }
    }
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  }
});
