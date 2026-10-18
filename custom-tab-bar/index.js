Component({
  data: {
    role: 'user',
    userTabs: [
      { text: '发任务', icon: '📝', pagePath: '/pages/publish/publish' },
      { text: '我的单', icon: '📋', pagePath: '/pages/my-orders/my-orders' },
      { text: '我的', icon: '👤', pagePath: '/pages/profile/profile' }
    ],
    runnerTabs: [
      { text: '待接单', icon: '🔔', pagePath: '/pages/pending/pending' },
      { text: '我的单', icon: '📋', pagePath: '/pages/my-orders/my-orders' },
      { text: '我的', icon: '👤', pagePath: '/pages/profile/profile' }
    ],
    selected: -1
  },
  lifetimes: {
    attached() { this.refresh(); }
  },
  methods: {
    refresh() {
      const app = getApp();
      const role = app.globalData.currentUser ? app.globalData.currentUser.role : 'user';
      const pages = getCurrentPages();
      const cur = pages[pages.length - 1];
      const route = cur ? '/' + cur.route : '';

      const tabs = role === 'runner' ? this.data.runnerTabs : this.data.userTabs;
      let selected = -1;
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].pagePath === route) { selected = i; break; }
      }
      this.setData({ role, selected });
    },
    switchTab(e) {
      const idx = Number(e.currentTarget.dataset.idx);
      const path = e.currentTarget.dataset.path;
      if (idx === this.data.selected) return;
      this.setData({ selected: idx });
      wx.switchTab({ url: path });
    }
  }
});
