function get(k, d) {
  try {
    const v = wx.getStorageSync(k);
    return v === '' || v === undefined ? d : v;
  } catch (e) { return d; }
}
function set(k, v) { wx.setStorageSync(k, v); }
function remove(k) { wx.removeStorageSync(k); }

function getUsers() { return get('users', []); }
function setUsers(u) { set('users', u); }

function getOrders() { return get('orders', []); }
function setOrders(o) { set('orders', o); }

function getCurrentUser() { return get('currentUser', null); }
function setCurrentUser(u) { set('currentUser', u); }

function generateOrderId() {
  const d = new Date();
  return 'E' + d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0') +
    Math.floor(Math.random() * 1000).toString().padStart(3, '0');
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return m + '分钟前';
  const h = Math.floor(m / 60);
  if (h < 24) return h + '小时前';
  const d = Math.floor(h / 24);
  return d + '天前';
}

function formatTime(ts) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

module.exports = {
  get, set, remove,
  getUsers, setUsers,
  getOrders, setOrders,
  getCurrentUser, setCurrentUser,
  generateOrderId, timeAgo, formatTime
};
