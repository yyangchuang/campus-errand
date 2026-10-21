Component({
  data: {
    icons: {
      post_normal: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIzIi8+PGxpbmUgeDE9IjEyIiB5MT0iOCIgeDI9IjEyIiB5Mj0iMTYiLz48bGluZSB4MT0iOCIgeTE9IjEyIiB4Mj0iMTYiIHkyPSIxMiIvPjwvc3ZnPg==',
      post_active: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjZiMzUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIzIi8+PGxpbmUgeDE9IjEyIiB5MT0iOCIgeDI9IjEyIiB5Mj0iMTYiLz48bGluZSB4MT0iOCIgeTE9IjEyIiB4Mj0iMTYiIHkyPSIxMiIvPjwvc3ZnPg==',
      orders_normal: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIzIi8+PGxpbmUgeDE9IjgiIHkxPSI4IiB4Mj0iMTYiIHkyPSI4Ii8+PGxpbmUgeDE9IjgiIHkxPSIxMyIgeDI9IjE2IiB5Mj0iMTMiLz48bGluZSB4MT0iOCIgeTE9IjE4IiB4Mj0iMTMiIHkyPSIxOCIvPjwvc3ZnPg==',
      orders_active: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjZiMzUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIzIi8+PGxpbmUgeDE9IjgiIHkxPSI4IiB4Mj0iMTYiIHkyPSI4Ii8+PGxpbmUgeDE9IjgiIHkxPSIxMyIgeDI9IjE2IiB5Mj0iMTMiLz48bGluZSB4MT0iOCIgeTE9IjE4IiB4Mj0iMTMiIHkyPSIxOCIvPjwvc3ZnPg==',
      me_normal: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjQiLz48cGF0aCBkPSJNNCAyMWMwLTQgNC03IDgtN3M4IDMgOCA3Ii8+PC9zdmc+',
      me_active: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjZiMzUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjQiLz48cGF0aCBkPSJNNCAyMWMwLTQgNC03IDgtN3M4IDMgOCA3Ii8+PC9zdmc+',
      pending_normal: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTggOGE2IDYgMCAxIDAtMTIgMGMwIDctMyA5LTMgOWgxOHMtMy0yLTMtOSIvPjxwYXRoIGQ9Ik0xMy43MyAyMWEyIDIgMCAwIDEtMy40NiAwIi8+PC9zdmc+',
      pending_active: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjZiMzUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTggOGE2IDYgMCAxIDAtMTIgMGMwIDctMyA5LTMgOWgxOHMtMy0yLTMtOSIvPjxwYXRoIGQ9Ik0xMy43MyAyMWEyIDIgMCAwIDEtMy40NiAwIi8+PC9zdmc+'
    },
    role: 'user',
    tabs: [],
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

      const defs = role === 'runner'
        ? [
            { text: '待接单', iconKey: 'pending', pagePath: '/pages/pending/pending' },
            { text: '我的单', iconKey: 'orders', pagePath: '/pages/my-orders/my-orders' },
            { text: '我的', iconKey: 'me', pagePath: '/pages/profile/profile' }
          ]
        : [
            { text: '发任务', iconKey: 'post', pagePath: '/pages/publish/publish' },
            { text: '我的单', iconKey: 'orders', pagePath: '/pages/my-orders/my-orders' },
            { text: '我的', iconKey: 'me', pagePath: '/pages/profile/profile' }
          ];

      let selected = -1;
      const tabs = defs.map((t, i) => {
        const isSel = t.pagePath === route;
        if (isSel) selected = i;
        const ik = t.iconKey + (isSel ? '_active' : '_normal');
        return {
          text: t.text,
          pagePath: t.pagePath,
          icon: this.data.icons[ik],
          selected: isSel
        };
      });

      this.setData({ role, tabs, selected });
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
