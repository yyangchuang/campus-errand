const api = require('../../utils/api.js');

const STATUS_MAP = {
  pending: { label: '已发布', cls: 'tag-orange' },
  accepted: { label: '已接单', cls: 'tag-blue' },
  delivering: { label: '运送中', cls: 'tag-blue' },
  delivered: { label: '已送达', cls: 'tag-pink' },
  completed: { label: '已完成', cls: 'tag-green' },
  cancelled: { label: '已取消', cls: 'tag-gray' }
};

Page({
  data: {
    role: 'user',
    roleLabel: '我发的',
    orderList: [],
    filteredList: [],
    filterTabs: [
      { key: 'all', label: '全部' },
      { key: 'pending', label: '待接单' },
      { key: 'accepted', label: '已接单' },
      { key: 'delivering', label: '运送中' },
      { key: 'completed', label: '已完成' }
    ],
    filterStatus: 'all',
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
    const user = wx.getStorageSync('userInfo');
    const roleLabel = user.role === 'runner' ? '我接的' : '我发的';
    this.setData({ role: user.role, roleLabel });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().refresh();
    }
    this.loadList();
  },
  async loadList() {
    try {
      const user = wx.getStorageSync('userInfo');
      const list = await api.getMine(user.role);
      const now = Date.now();
      this.setData({
        orderList: list.map(o => {
          const st = STATUS_MAP[o.status] || { label: o.status, cls: 'tag-gray' };
          const diff = now - o.createdAt;
          const m = Math.floor(diff / 60000);
          let timeLabel = '刚刚';
          if (m >= 60) timeLabel = Math.floor(m / 60) + '小时前';
          else if (m >= 1) timeLabel = m + '分钟前';
          const packages = o.packages || [];
          return {
            ...o,
            pkgCount: packages.length,
            pkgTags: packages.map(p => ({
              text: p.ptype === 'small' ? '小' : p.ptype === 'mid' ? '中' : p.ptype === 'big' ? '大' : '急',
              cls: 'ptype-' + p.ptype
            })),
            statusLabel: st.label,
            statusCls: st.cls,
            timeLabel
          };
        })
        });
        this.applyFilter();
      } catch (e) {
      console.error(e);
    }
  },
  applyFilter() {
    const { orderList, filterStatus } = this.data;
    const filtered = filterStatus === 'all'
      ? orderList
      : orderList.filter(o => o.status === filterStatus);
    this.setData({ filteredList: filtered });
  },
  filterChange(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ filterStatus: key });
    this.applyFilter();
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  }
});
