const { ICONS } = require("../../utils/icons.js");
const api = require('../../utils/api.js');

const PHONE_ROLES = [
  { prefix: '1350000', role: 'runner', openid: 'runner001', label: '跑腿员' },
  { prefix: '1340000', role: 'admin', openid: 'admin001', label: '管理员' }
];

function detectRole(phone) {
  if (!phone || phone.length < 7) return { role: 'user', openid: 'student001', label: '普通学生' };
  for (const r of PHONE_ROLES) {
    if (phone.startsWith(r.prefix)) return r;
  }
  return { role: 'user', openid: 'student001', label: '普通学生' };
}

Page({
  data: {
    icons: ICONS,
    showPhoneExpand: false,
    phone: '',
    phoneValid: false,
    phoneError: '',
    phoneFocus: false,
    phoneShake: false,
    code: '',
    codeValid: false,
    codeFocus: false,
    codeCountdown: 0,
    agreed: false,
    loggingIn: false,
    showPhone: false
  },

  onLoad() {
    if (wx.getStorageSync('userInfo') && wx.getStorageSync('token')) {
      this.redirectByRole();
    }
  },

  togglePhoneExpand() {
    this.setData({ showPhoneExpand: !this.data.showPhoneExpand });
  },

  toggleAgree() {
    this.setData({ agreed: !this.data.agreed });
  },

  openAgree() { wx.navigateTo({ url: '/pages/legal/legal?type=agree' }); },
  openPrivacy() { wx.navigateTo({ url: '/pages/legal/legal?type=privacy' }); },

  showPhonePanel() { this.setData({ showPhone: true }); },
  hidePhonePanel() { this.setData({ showPhone: false }); },

  onPhoneFocus() { this.setData({ phoneFocus: true, phoneError: '', phoneShake: false }); },
  onPhoneBlur() {
    this.setData({ phoneFocus: false });
    if (this.data.phone && !/^1[3-9]\d{9}$/.test(this.data.phone)) {
      this.setData({ phoneError: '请输入正确的手机号', phoneShake: true });
      setTimeout(() => this.setData({ phoneShake: false }), 420);
    }
  },

  onPhoneInput(e) {
    const phone = e.detail.value;
    const phoneValid = /^1[3-9]\d{9}$/.test(phone);
    this.setData({ phone, phoneValid, phoneError: phone && !phoneValid ? '请输入正确的手机号' : '', phoneShake: false });
  },

  clearPhone() { this.setData({ phone: '', phoneValid: false, phoneError: '' }); },

  onCodeFocus() { this.setData({ codeFocus: true }); },
  onCodeBlur() { this.setData({ codeFocus: false }); },

  onCodeInput(e) {
    const code = e.detail.value;
    this.setData({ code, codeValid: code.length === 6 });
  },

  sendCode() {
    if (this.data.codeCountdown > 0) return;
    if (!this.data.phoneValid) {
      this.setData({ phoneError: '请先输入正确的手机号' });
      return;
    }
    const r = detectRole(this.data.phone);
    wx.showToast({ title: '开发阶段验证码: ' + r.openid.slice(-4).padStart(6, '0'), icon: 'none', duration: 3000 });
    this.setData({ codeCountdown: 60 });
    this._timer = setInterval(() => {
      if (this.data.codeCountdown <= 1) {
        clearInterval(this._timer);
        this.setData({ codeCountdown: 0 });
      } else {
        this.setData({ codeCountdown: this.data.codeCountdown - 1 });
      }
    }, 1000);
  },

  async onPhoneLogin() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }
    if (!this.data.phoneValid) {
      this.setData({ phoneError: '请输入正确的手机号' });
      return;
    }
    if (!this.data.codeValid) {
      wx.showToast({ title: '请输入验证码', icon: 'none' });
      return;
    }
    if (this.data.loggingIn) return;
    this.setData({ loggingIn: true });
    const r = detectRole(this.data.phone);

    try {
      const resp = await api.devLogin(r.openid);
      api.saveToken(resp.token);
      wx.setStorageSync('userInfo', resp.userInfo);
      getApp().globalData.currentUser = resp.userInfo;
      wx.showToast({ title: '欢迎，' + resp.userInfo.nickname, icon: 'success' });
      setTimeout(() => this.redirectByRole(), 600);
    } catch (e) {
      wx.showToast({ title: (e && e.msg) || '登录失败，请检查后端', icon: 'none' });
    } finally {
      this.setData({ loggingIn: false });
    }
  },

  async onWechatLogin() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }
    if (this.data.loggingIn) return;
    this.setData({ loggingIn: true });

    try {
      const loginCode = await new Promise((resolve, reject) => {
        wx.login({ success: res => resolve(res.code), fail: reject });
      });
      const resp = await api.wechatLogin(loginCode, null, null);
      api.saveToken(resp.token);
      wx.setStorageSync('userInfo', resp.userInfo);
      getApp().globalData.currentUser = resp.userInfo;
      wx.showToast({ title: '欢迎，' + resp.userInfo.nickname, icon: 'success' });
      setTimeout(() => this.redirectByRole(), 600);
    } catch (e) {
      wx.showToast({ title: (e && e.msg) || '微信登录失败', icon: 'none' });
    } finally {
      this.setData({ loggingIn: false });
    }
  },

  onGetPhone(e) {
    if (e.detail && e.detail.code) console.log('[PhoneNumber] code:', e.detail.code);
  },

  redirectByRole() {
    const app = getApp();
    const role = app.globalData.currentUser.role;
    if (role === 'runner') {
      wx.switchTab({ url: '/pages/pending/pending' });
    } else {
      wx.switchTab({ url: '/pages/publish/publish' });
    }
  }
});
