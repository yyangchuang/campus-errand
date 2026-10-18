const store = require('../../utils/store.js');
const api = require('../../utils/api.js');

Page({
  data: {
    stations: [],
    expressList: [],
    pricing: {},
    ptypeOptions: [
      { key: 'small', label: '小包裹', desc: '衣服/手机壳', icon: '🏷️' },
      { key: 'mid', label: '中包裹', desc: '鞋盒/书/日用品', icon: '📦' },
      { key: 'big', label: '大包裹', desc: '行李箱/大箱', icon: '📦' },
      { key: 'urgent', label: '急件/特殊', desc: '易碎/生鲜/文件', icon: '⚡' }
    ],
    stationIdx: 0,
    address: '',
    note: '',
    packages: [],
    showSheet: false,
    sheetStep: 1,
    tempExpressIdx: 0,
    tempCode: '',
    tempTail: '',
    tempPtype: 'small',
    tempName: '',
    totalPrice: 0,
    pkgCount: 0,
    defaultTail: '',
    etaDate: '',
    etaTime: '',
    etaDateMin: '',
    etaPreview: '',
    etaDisplay: '',
    showEtaSheet: false,
    etaQuick: null,
    etaGroups: [],
    etaChosenVal: '',
    bannerDismissed: false
  },

  onLoad() {
    const app = getApp();
    const phone = app.globalData.currentUser ? app.globalData.currentUser.phone : '';
    const tail = phone ? phone.replace(/.*(\d{4})$/, '$1') : '';
    const lastAddr = store.get('lastAddress', '');

    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    const makeSlot = (hour, minute, offsetDays) => {
      const start = new Date(now.getTime() + offsetDays * 86400000);
      start.setHours(hour, minute, 0, 0);
      if (start.getTime() <= now.getTime() + 30 * 60000) return null;

      const end = new Date(start.getTime() + 60 * 60000);
      const dateStr = start.getFullYear() + '-' + pad(start.getMonth() + 1) + '-' + pad(start.getDate());
      const startStr = pad(hour) + ':' + pad(minute);
      const endStr = pad(end.getHours()) + ':' + pad(end.getMinutes());

      let dateLabel;
      const md = (start.getMonth() + 1) + '/' + start.getDate();
      if (offsetDays === 0) dateLabel = '今天 ' + md;
      else if (offsetDays === 1) dateLabel = '明天 ' + md;
      else dateLabel = weekday[start.getDay()] + ' ' + md;

      return {
        dateLabel,
        timeLabel: startStr + ' - ' + endStr,
        value: dateStr + 'T' + startStr,
        dateStr,
        timeStr: startStr
      };
    };

    const slots = [];
    const hourRanges = [10, 22];
    for (let day = 0; day < 3; day++) {
      for (let h = hourRanges[0]; h < hourRanges[1]; h++) {
        const s = makeSlot(h, 0, day);
        if (s) slots.push(s);
      }
    }

    const etaDateMin = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

    const groups = [];
    let currentGroup = null;
    slots.forEach(s => {
      if (!currentGroup || currentGroup.label !== s.dateLabel) {
        currentGroup = { label: s.dateLabel, slots: [] };
        groups.push(currentGroup);
      }
      currentGroup.slots.push(s);
    });

    const quickDate = new Date(now.getTime() + 60 * 60000);
    const quickMd = (quickDate.getMonth() + 1) + '/' + quickDate.getDate();
    const quickSub = '最快 ' + quickMd + ' ' + pad(quickDate.getHours()) + ':' + pad(quickDate.getMinutes()) + ' 左右送达';
    const quickDisplay = quickMd + ' ' + pad(quickDate.getHours()) + ':' + pad(quickDate.getMinutes()) + ' 左右';

    const quick = {
      label: '立即送达',
      sub: quickSub,
      value: quickDate.getFullYear() + '-' + pad(quickDate.getMonth() + 1) + '-' + pad(quickDate.getDate()) + 'T' + pad(quickDate.getHours()) + ':' + pad(quickDate.getMinutes()),
      etaDate: quickDate.getFullYear() + '-' + pad(quickDate.getMonth() + 1) + '-' + pad(quickDate.getDate()),
      etaTime: pad(quickDate.getHours()) + ':' + pad(quickDate.getMinutes()),
      display: quickDisplay,
      isQuick: true
    };

    let defaultDate = quick.etaDate;
    let defaultTime = quick.etaTime;
    let defaultDisplay = quick.display;
    let defaultValue = quick.value;

    this.setData({
      expressList: app.globalData.expressList,
      pricing: app.globalData.pricing,
      defaultTail: tail,
      address: lastAddr,
      etaDate: defaultDate,
      etaTime: defaultTime,
      etaDateMin,
      etaDisplay: defaultDisplay,
      etaQuick: quick,
      etaGroups: groups,
      etaChosenVal: defaultValue
    });

    api.getStations().then(stations => {
      this.setData({ stations });
    }).catch(e => {
      console.error('get stations failed', e);
      this.setData({
        stations: [
          { id: 'S001', name: '顺丰驿站', addr: '1号宿舍楼北' },
          { id: 'S002', name: '京东自提柜', addr: '2号宿舍楼南' },
          { id: 'S003', name: '菜鸟驿站', addr: '食堂旁边' }
        ]
      });
    });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().refresh();
    }
  },

  dismissBanner() {
    this.setData({ bannerDismissed: true });
  },

  onStationChange(e) {
    this.setData({ stationIdx: Number(e.detail.value) });
  },

  onEtaDateChange(e) {},
  onEtaTimeChange(e) {},

  showEtaSheet() {
    this.setData({ showEtaSheet: true });
  },
  closeEtaSheet() {
    this.setData({ showEtaSheet: false });
  },
  pickEta(e) {
    const v = e.currentTarget.dataset.value;
    let target = null;
    if (v === this.data.etaQuick.value) {
      target = this.data.etaQuick;
    } else {
      for (const g of this.data.etaGroups) {
        target = g.slots.find(s => s.value === v);
        if (target) break;
      }
    }
    if (!target) return;

    const isQuick = target.isQuick;
    let display;
    if (isQuick) {
      display = target.display;
    } else {
      display = target.dateLabel + ' ' + target.timeLabel;
    }

    this.setData({
      etaDate: target.etaDate || target.dateStr,
      etaTime: target.etaTime || target.timeStr,
      etaDisplay: display,
      etaPreview: (target.etaDate || target.dateStr) + ' ' + (target.etaTime || target.timeStr),
      etaChosenVal: v,
      showEtaSheet: false
    });
  },

  onAddressInput(e) { this.setData({ address: e.detail.value }); },
  onNoteInput(e) { this.setData({ note: e.detail.value }); },

  showAddSheet() {
    this.setData({
      showSheet: true,
      sheetStep: 1,
      tempExpressIdx: 0,
      tempCode: '',
      tempTail: this.data.defaultTail,
      tempPtype: 'small',
      tempName: ''
    });
  },

  closeSheet() {
    this.setData({ showSheet: false });
  },

  chooseScan() {
    const that = this;
    wx.showModal({
      title: '模拟扫码识别',
      content: 'MVP 暂未接入 OCR，将模拟识别一个示例快递',
      confirmText: '模拟扫码',
      success: (r) => {
        if (r.confirm) {
          that.setData({
            sheetStep: 2,
            tempExpressIdx: 0,
            tempCode: 'SF-' + (3000 + Math.floor(Math.random() * 999)),
            tempTail: that.data.defaultTail || '8888',
            tempPtype: 'mid',
            tempName: '运动鞋鞋盒'
          });
        }
      }
    });
  },

  switchToManual() {
    this.setData({ sheetStep: 1 });
  },

  onQuickExpress(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    this.setData({ tempExpressIdx: idx });
  },
  onTempCode(e) { this.setData({ tempCode: e.detail.value }); },
  onTempTail(e) { this.setData({ tempTail: e.detail.value }); },
  onTempName(e) { this.setData({ tempName: e.detail.value }); },
  pickPtype(e) {
    const ptype = e.currentTarget.dataset.ptype;
    this.setData({ tempPtype: ptype });
  },

  confirmAddPackage() {
    const { tempExpressIdx, tempCode, tempTail, tempPtype, tempName, expressList, pricing } = this.data;
    if (!tempCode) { wx.showToast({ title: '请填写取件码', icon: 'none' }); return; }
    if (!tempTail) { wx.showToast({ title: '请填写手机尾号', icon: 'none' }); return; }
    const newPkg = {
      express: expressList[tempExpressIdx],
      code: tempCode,
      tail: tempTail,
      ptype: tempPtype,
      price: pricing[tempPtype] || 3,
      name: tempName || ''
    };
    const pkgs = [...this.data.packages, newPkg];
    this.setData({
      packages: pkgs,
      showSheet: false
    });
    this.recalcTotal();
    wx.showToast({ title: '已添加', icon: 'success' });
  },

  removePackage(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const pkgs = this.data.packages.filter((_, i) => i !== idx);
    this.setData({ packages: pkgs });
    this.recalcTotal();
  },

  recalcTotal() {
    const total = this.data.packages.reduce((s, p) => s + p.price, 0);
    this.setData({
      totalPrice: total,
      pkgCount: this.data.packages.length
    });
  },

  submitOrder() {
    const app = getApp();
    if (!app.requireLogin()) return;

    const { stationIdx, stations, packages, address, note, totalPrice } = this.data;
    if (packages.length === 0) { wx.showToast({ title: '请至少添加一个快递', icon: 'none' }); return; }
    if (!address) { wx.showToast({ title: '请填写送达地址', icon: 'none' }); return; }

    const that = this;
    wx.showModal({
      title: '确认支付 ¥' + totalPrice,
      content: '发单需先付款，跑腿员接单后开始取件',
      confirmText: '确认支付',
      success: (r) => {
        if (!r.confirm) return;
        that.doCreateOrder();
      }
    });
  },

  async doCreateOrder() {
    const { stationIdx, stations, packages, address, note, totalPrice } = this.data;
    store.set('lastAddress', address);
    const station = stations[stationIdx];

    const req = {
      stationId: station.id,
      stationName: station.name,
      stationAddr: station.addr || '',
      address,
      note: note || '',
      total: totalPrice,
      estimatedTime: this.data.etaDate && this.data.etaTime
        ? this.data.etaDate + 'T' + this.data.etaTime
        : '',
      packages: packages.map(p => ({
        express: p.express,
        code: p.code,
        tail: p.tail,
        ptype: p.ptype,
        price: p.price,
        name: p.name || ''
      }))
    };

    try {
      wx.showLoading({ title: '发布中...' });
      await api.createOrder(req);
      wx.hideLoading();
      wx.showToast({ title: '发布成功！', icon: 'success' });
      setTimeout(() => {
        this.setData({ packages: [], address: '', note: '', totalPrice: 0, pkgCount: 0 });
        wx.switchTab({ url: '/pages/my-orders/my-orders' });
      }, 800);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: (e && e.msg) || '发布失败', icon: 'none' });
    }
  }
});
