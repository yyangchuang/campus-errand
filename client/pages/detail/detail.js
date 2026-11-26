const { ICONS } = require("../../utils/icons.js");
const api = require('../../utils/api.js');

const STATUS_FLOW = ['pending', 'accepted', 'delivering', 'delivered', 'completed'];
const STATUS_LABELS = {
  pending: '已发布', accepted: '已接单',
  delivering: '运送中', delivered: '已送达',
  completed: '已完成', cancelled: '已取消'
};

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const pad = n => (n < 10 ? '0' + n : '' + n);
  const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  if (sameDay) return '今天 ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  const yesterday = new Date(now.getTime() - 86400000);
  const isYesterday = d.getFullYear() === yesterday.getFullYear() && d.getMonth() === yesterday.getMonth() && d.getDate() === yesterday.getDate();
  if (isYesterday) return '昨天 ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function formatHMS(ms) {
  if (ms <= 0) return '0分钟';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return h + '小时' + m + '分钟';
  return m + '分钟';
}

Page({
  data: {
    icons: ICONS,
    order: null,
    user: null,
    role: 'user',
    flowSteps: [],
    timelineLabels: {},
    isCancelled: false,
    canCancel: false,
    canAccept: false,
    canDeliver: false,
    canArrive: false,
    canConfirm: false,
    runner: null,
    showEta: false,
    isUrgent: false,
    etaText: '',
    isDelivered: false
  },

  onLoad(opts) {
    this.orderId = opts.id;
  },

  onShow() {
    this.loadOrder();
  },

  async loadOrder() {
    const app = getApp();
    if (!app.requireLogin()) return;
    try {
      const detail = await api.getOrder(this.orderId);
      if (!detail || !detail.order) {
        wx.showToast({ title: '订单不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1000);
        return;
      }

      const order = detail.order;
      const packages = detail.packages || [];
      const timeline = (detail.timeline || []).map(t => ({
        status: t.status,
        at: new Date(t.createdAt).getTime()
      }));

      order.packages = packages;
      order.timeline = timeline;
      order.runnerName = detail.runnerName || order.runnerName;
      order.publisherName = detail.publisherName || order.publisherName;
      order.publisherPhone = detail.publisherPhone || order.publisherPhone;

      order.paid = order.paid !== false;
      order.refunded = order.refunded || false;

      const user = wx.getStorageSync('userInfo');
      const runner = order.runnerId ? { openid: order.runnerId, nickname: order.runnerName || '跑腿员', phone: order.runnerPhone || '' } : null;

      const isCancelled = order.status === 'cancelled';
      const curIdx = STATUS_FLOW.indexOf(order.status);

      let flowSteps = STATUS_FLOW.map((s, i) => ({
        status: s,
        label: STATUS_LABELS[s],
        done: isCancelled ? false : curIdx > i,
        active: isCancelled ? false : curIdx === i
      }));

      if (isCancelled) {
        flowSteps = [{
          status: 'cancelled',
          label: order.refunded ? '已取消·已退款' : '订单已取消',
          done: true,
          active: true
        }, ...flowSteps];
      }

      const timelineLabels = {};
      if (timeline.length > 0) {
        STATUS_FLOW.forEach(s => {
          const evt = timeline.find(t => t.status === s);
          if (evt) timelineLabels[s] = formatTime(evt.at);
        });
        if (isCancelled) {
          const cancelEvt = timeline.find(t => t.status === 'cancelled');
          if (cancelEvt) timelineLabels['cancelled'] = formatTime(cancelEvt.at);
        }
      }

      const role = user.role;
      const isRunner = role === 'runner';
      const isPublisher = String(order.userId) === String(user.id);
      const isMyOrder = String(order.runnerId) === String(user.id);

      const canCancel = ((order.status === 'pending' || order.status === 'accepted') && isPublisher);
      const canAccept = (order.status === 'pending' && isRunner && !isPublisher);
      const canDeliver = (order.status === 'accepted' && isRunner && isMyOrder);
      const canArrive = (order.status === 'delivering' && isRunner && isMyOrder);
      const canConfirm = (order.status === 'delivered' && isPublisher);

      let showEta = false;
      let isUrgent = false;
      let etaText = '';
      let isDelivered = false;

      if (order.status !== 'cancelled') {
        if (order.deliveredAt) {
          isDelivered = true;
          etaText = formatTime(new Date(order.deliveredAt).getTime());
          showEta = true;
        } else if (order.estimatedTime) {
          etaText = formatTime(new Date(order.estimatedTime).getTime());
          showEta = true;
        }
        const pkgs = order.packages || [];
        isUrgent = pkgs.some(p => p.ptype === 'urgent');
      }

      this.setData({
        order: this.enrichOrder(order),
        user, role, runner,
        flowSteps, timelineLabels,
        isCancelled,
        canCancel, canAccept, canDeliver, canArrive, canConfirm,
        showEta, isUrgent, etaText, isDelivered
      });
    } catch (e) {
      console.error(e);
      wx.showToast({ title: (e && e.msg) || '加载失败', icon: 'none' });
    }
  },

  enrichOrder(o) {
    const packages = o.packages || [];
    return {
      ...o,
      packages,
      pkgCount: packages.length,
      statusLabel: STATUS_LABELS[o.status] || o.status
    };
  },

  async cancel() {
    const order = this.data.order;
    const doCancel = async () => {
      try {
        await api.cancelOrder(this.orderId);
        wx.showToast({ title: '已取消', icon: 'success' });
        this.loadOrder();
      } catch (e) {
        console.error(e);
      }
    };

    if (order.paid && !order.refunded) {
      wx.showModal({
        title: '确认取消并退款 ¥' + order.total,
        content: '已付款的订单取消后将自动退款',
        confirmText: '确认取消',
        success: (r) => { if (r.confirm) doCancel(); }
      });
    } else {
      wx.showModal({
        title: '确定取消这个订单吗？',
        content: '取消后无法恢复',
        success: (r) => { if (r.confirm) doCancel(); }
      });
    }
  },

  async accept() {
    try {
      await api.acceptOrder(this.orderId);
      wx.showToast({ title: '已接单', icon: 'success' });
      this.loadOrder();
    } catch (e) {
      console.error(e);
    }
  },

  async deliver() {
    try {
      await api.pickupOrder(this.orderId);
      wx.showToast({ title: '开始运送', icon: 'success' });
      this.loadOrder();
    } catch (e) {
      console.error(e);
      wx.showToast({ title: (e && e.msg) || '操作失败', icon: 'none' });
    }
  },

  arrive() {
    const that = this;
    wx.showModal({
      title: '确认已送达',
      content: '建议拍一张送达凭证（快递放门口/签收照片）',
      confirmText: '拍照凭证',
      cancelText: '直接送达',
      success: (r) => {
        if (r.confirm) {
          that.takeProof();
        } else {
          that.doArrive();
        }
      }
    });
  },

  takeProof() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      success(res) {
        const tempPath = res.tempFiles[0].tempFilePath;
        that.doArrive(tempPath);
      },
      fail() {
        wx.showToast({ title: '拍照取消', icon: 'none' });
      }
    });
  },

  async doArrive(proofImg) {
    try {
      await api.deliverOrder(this.orderId, proofImg);
      wx.showToast({ title: '已送达', icon: 'success' });
      this.loadOrder();
    } catch (e) {
      console.error(e);
    }
  },

  previewProof(e) {
    wx.previewImage({ urls: [e.currentTarget.dataset.src] });
  },

  async confirm() {
    wx.showModal({
      title: '确认签收？',
      content: '签收后订单完成',
      success: async (r) => {
        if (r.confirm) {
          try {
            await api.confirmOrder(this.orderId);
            wx.showToast({ title: '已签收', icon: 'success' });
            this.loadOrder();
          } catch (e) {
            console.error(e);
            wx.showToast({ title: (e && e.msg) || '签收失败', icon: 'none' });
          }
        }
      }
    });
  },

  callRunner() {
    const user = wx.getStorageSync('userInfo');
    const isRunner = user.role === 'runner' && this.data.order.runnerId === user.openid;
    const targetName = isRunner ? (this.data.order.publisherName || '发件人') : (this.data.runner && this.data.runner.nickname || '对方');
    const targetPhone = isRunner ? (this.data.order.publisherPhone || '') : (this.data.runner && this.data.runner.phone || '');
    if (!targetPhone) { wx.showToast({ title: '对方信息不存在', icon: 'none' }); return; }
    wx.showModal({
      title: '拨打 ' + targetName,
      content: '手机：' + targetPhone,
      showCancel: false,
      success: () => {}
    });
  }
});
