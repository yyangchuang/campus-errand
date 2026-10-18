const BASE_URL = 'http://localhost:8080/api';

function getToken() {
  return wx.getStorageSync('token') || '';
}

function saveToken(token) {
  wx.setStorageSync('token', token);
}

function clearToken() {
  wx.removeStorageSync('token');
}

const DEBUG = true;

function request(method, path, data) {
  const url = BASE_URL + path;
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': getToken() ? 'Bearer ' + getToken() : ''
      },
      success: res => {
        if (DEBUG) {
          console.log('[API ➡️]', method, url);
          console.log('[API 📥 入参]', data || '(无)');
          console.log('[API ✅]', method, path, '→ HTTP', res.statusCode);
          console.log('[API 📤 返回]', JSON.stringify(res.data, null, 2));
        }
        const body = res.data;
        if (res.statusCode === 401 || (body && body.code === 401)) {
          clearToken();
          wx.showToast({ title: '登录已过期', icon: 'none' });
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/login/login' });
          }, 800);
          reject({ code: 401, msg: body && body.msg ? body.msg : '未登录' });
          return;
        }
        if (body && body.code === 200) {
          resolve(body.data);
        } else {
          reject(body || { code: res.statusCode, msg: '请求失败' });
        }
      },
      fail: err => {
        if (DEBUG) {
          console.log('[API ➡️]', method, url);
          console.log('[API 📥 入参]', data || '(无)');
          console.log('[API ❌]', method, path, '→ FAIL', err);
        }
        wx.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
}

module.exports = {
  BASE_URL,
  getToken,
  saveToken,
  clearToken,

  devLogin(openid) {
    return request('GET', '/auth/dev-login?openid=' + encodeURIComponent(openid));
  },

  wechatLogin(loginCode, nickname, avatar) {
    const body = { loginCode };
    if (nickname) body.nickname = nickname;
    if (avatar) body.avatar = avatar;
    return request('POST', '/auth/wechat-login', body);
  },

  getStations() {
    return request('GET', '/stations');
  },

  createOrder(order) {
    return request('POST', '/orders', order);
  },

  getPending() {
    return request('GET', '/orders/pending');
  },

  getMine(role) {
    return request('GET', '/orders/mine?role=' + role);
  },

  getOrder(id) {
    return request('GET', '/orders/' + id);
  },

  acceptOrder(id) {
    return request('POST', '/orders/' + id + '/accept');
  },

  pickupOrder(id) {
    return request('POST', '/orders/' + id + '/pickup');
  },

  deliverOrder(id, proof) {
    return request('POST', '/orders/' + id + '/deliver', proof ? { proof } : {});
  },

  confirmOrder(id) {
    return request('POST', '/orders/' + id + '/confirm');
  },

  cancelOrder(id) {
    return request('POST', '/orders/' + id + '/cancel');
  },

  getIncome(period) {
    return request('GET', '/runner/income?period=' + (period || 'week'));
  }
};
