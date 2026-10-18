const store = require('./store.js');

function seed() {
  const users = [
    { openid: 'user_001', nickname: '同学小张', role: 'user', avatar: '张', phone: '13812348888', school: '示例大学', stats: { publishCount: 5, acceptCount: 0, completeCount: 2 } },
    { openid: 'user_002', nickname: '李同学', role: 'user', avatar: '李', phone: '13956781234', school: '示例大学', stats: { publishCount: 3, acceptCount: 0, completeCount: 3 } },
    { openid: 'runner_001', nickname: '跑腿小哥A', role: 'runner', avatar: '🏃', phone: '13500000001', school: '示例大学', stats: { publishCount: 0, acceptCount: 23, completeCount: 23, rating: 4.9 } },
    { openid: 'runner_002', nickname: '跑腿小哥B', role: 'runner', avatar: '🏃', phone: '13500000002', school: '示例大学', stats: { publishCount: 0, acceptCount: 15, completeCount: 15, rating: 4.8 } },
    { openid: 'admin_001', nickname: '管理员', role: 'admin', avatar: '⚙️', phone: '13400000000', school: '示例大学', stats: { publishCount: 0, acceptCount: 0, completeCount: 0 } }
  ];
  store.setUsers(users);

  const now = Date.now();
  const orders = [
    {
      id: 'E202610081530001', userId: 'user_001', runnerId: null,
      takeMode: 'grab', assignTo: null,
      stationId: 'cainiao_e', stationName: '菜鸟驿站（东门店）', stationAddr: '东门体育馆旁',
      packages: [
        { express: '圆通', code: '7-2-8862', tail: '8888', ptype: 'small', price: 3, name: '衣服·手机壳' },
        { express: '顺丰', code: '7-3-2210', tail: '8888', ptype: 'mid', price: 5, name: '运动鞋鞋盒' }
      ],
      address: '3号宿舍楼 512室', note: '到了打电话',
      total: 8, status: 'pending',
      paid: true, paidAt: now - 3 * 60000, payMethod: 'mock', refunded: false,
      createdAt: now - 3 * 60000,
      timeline: [
        { at: now - 3 * 60000, status: 'pending' }
      ]
    },
    {
      id: 'E202610081535002', userId: 'user_001', runnerId: 'runner_001',
      runnerName: '跑腿小哥A',
      takeMode: 'grab', assignTo: null,
      stationId: 'sf', stationName: '顺丰速运站', stationAddr: '南门外50米',
      packages: [
        { express: '顺丰', code: 'SF-3382', tail: '8888', ptype: 'mid', price: 5, name: '文件急件' }
      ],
      address: '3号宿舍楼 512室', note: '文件急件，优先处理',
      total: 5, status: 'accepted',
      paid: true, paidAt: now - 20 * 60000, payMethod: 'mock', refunded: false,
      createdAt: now - 20 * 60000,
      timeline: [
        { at: now - 20 * 60000, status: 'pending' },
        { at: now - 15 * 60000, status: 'accepted' }
      ]
    },
    {
      id: 'E202610081430003', userId: 'user_001', runnerId: 'runner_001',
      runnerName: '跑腿小哥A',
      takeMode: 'grab', assignTo: null,
      stationId: 'jd', stationName: '京东快递站', stationAddr: '后勤服务中心',
      packages: [
        { express: '京东', code: 'JD-8801', tail: '8888', ptype: 'big', price: 10, name: '大件·行李箱' }
      ],
      address: '3号宿舍楼 512室', note: '大件，帮忙抬一下',
      total: 10, status: 'delivering',
      paid: true, paidAt: now - 45 * 60000, payMethod: 'mock', refunded: false,
      createdAt: now - 45 * 60000,
      timeline: [
        { at: now - 45 * 60000, status: 'pending' },
        { at: now - 40 * 60000, status: 'accepted' },
        { at: now - 20 * 60000, status: 'delivering' }
      ]
    },
    {
      id: 'E202610081300004', userId: 'user_001', runnerId: 'runner_001',
      runnerName: '跑腿小哥A',
      takeMode: 'grab', assignTo: null,
      stationId: 'cainiao_w', stationName: '菜鸟驿站（西门店）', stationAddr: '西门商业街',
      packages: [
        { express: '中通', code: 'ZT-6677', tail: '8888', ptype: 'small', price: 3, name: '零食大礼包' }
      ],
      address: '3号宿舍楼 512室', note: '到楼下喊我一声',
      total: 3, status: 'delivered',
      paid: true, paidAt: now - 80 * 60000, payMethod: 'mock', refunded: false,
      createdAt: now - 80 * 60000,
      timeline: [
        { at: now - 80 * 60000, status: 'pending' },
        { at: now - 70 * 60000, status: 'accepted' },
        { at: now - 50 * 60000, status: 'delivering' },
        { at: now - 10 * 60000, status: 'delivered' }
      ]
    },
    {
      id: 'E202610071800006', userId: 'user_001', runnerId: 'runner_001',
      runnerName: '跑腿小哥A',
      takeMode: 'grab', assignTo: null,
      stationId: 'jd', stationName: '京东快递站', stationAddr: '后勤服务中心',
      packages: [
        { express: '京东', code: 'JD-7788', tail: '8888', ptype: 'big', price: 10, name: '行李箱' }
      ],
      address: '3号宿舍楼 512室', note: '',
      total: 10, status: 'completed',
      paid: true, paidAt: now - 24 * 60 * 60000, payMethod: 'mock', refunded: false,
      createdAt: now - 24 * 60 * 60000,
      timeline: [
        { at: now - 24 * 60 * 60000, status: 'pending' },
        { at: now - 23 * 60 * 60000, status: 'accepted' },
        { at: now - 22 * 60 * 60000, status: 'delivering' },
        { at: now - 22.5 * 60 * 60000, status: 'delivered' },
        { at: now - 22 * 60 * 60000, status: 'completed' }
      ]
    },
    {
      id: 'E202610080900007', userId: 'user_002', runnerId: null,
      takeMode: 'grab', assignTo: null,
      stationId: 'cainiao_w', stationName: '菜鸟驿站（西门店）', stationAddr: '西门商业街',
      packages: [
        { express: '中通', code: 'ZT-9900', tail: '4444', ptype: 'small', price: 3, name: '耳机' },
        { express: '韵达', code: 'YD-1133', tail: '4444', ptype: 'small', price: 3, name: '袜子' }
      ],
      address: '1号宿舍楼 120', note: '',
      total: 6, status: 'cancelled',
      paid: true, paidAt: now - 120 * 60000, payMethod: 'mock',
      refunded: true, refundAt: now - 60 * 60000,
      createdAt: now - 120 * 60000,
      timeline: [
        { at: now - 120 * 60000, status: 'pending' },
        { at: now - 60 * 60000, status: 'cancelled' }
      ]
    }
  ];
  store.setOrders(orders);
}

module.exports = { seed };
