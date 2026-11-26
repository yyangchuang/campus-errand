-- ===== 用户表 =====
CREATE TABLE IF NOT EXISTS user (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  openid      VARCHAR(64) NOT NULL UNIQUE,
  nickname    VARCHAR(32) NOT NULL,
  phone       VARCHAR(16),
  role        VARCHAR(16) NOT NULL DEFAULT 'user',
  avatar      VARCHAR(128),
  school      VARCHAR(64),
  rating      DECIMAL(3,2) DEFAULT 5.0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== 驿站表 =====
CREATE TABLE IF NOT EXISTS station (
  id    VARCHAR(32) PRIMARY KEY,
  name  VARCHAR(64) NOT NULL,
  addr  VARCHAR(128)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== 订单表 =====
CREATE TABLE IF NOT EXISTS orders (
  id             VARCHAR(24) PRIMARY KEY,
  user_id        BIGINT NOT NULL,
  runner_id      BIGINT,
  station_id     VARCHAR(32) NOT NULL,
  station_name   VARCHAR(64) NOT NULL,
  station_addr   VARCHAR(128),
  address        VARCHAR(256) NOT NULL,
  note           VARCHAR(512),
  total          DECIMAL(8,2) NOT NULL,
  status         VARCHAR(16) NOT NULL,
  take_mode      VARCHAR(8) DEFAULT 'grab',
  paid           TINYINT(1) DEFAULT 0,
  paid_at        DATETIME,
  pay_method     VARCHAR(16),
  refunded       TINYINT(1) DEFAULT 0,
  refund_at      DATETIME,
  delivery_proof VARCHAR(512),
  delivered_at   DATETIME,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_runner (runner_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== 包裹表 =====
CREATE TABLE IF NOT EXISTS package (
  id       BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id VARCHAR(24) NOT NULL,
  express  VARCHAR(32) NOT NULL,
  code     VARCHAR(64) NOT NULL,
  tail     VARCHAR(8),
  ptype    VARCHAR(8) NOT NULL,
  price    DECIMAL(8,2) NOT NULL,
  name     VARCHAR(64),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== 订单时间线 =====
CREATE TABLE IF NOT EXISTS order_timeline (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id   VARCHAR(24) NOT NULL,
  status     VARCHAR(16) NOT NULL,
  remark     VARCHAR(256),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
