# 校园跑腿小程序 · 测试设计用例文档

> 版本：v0.1 | 基于代码 commit + PRD v0.6
> 更新时间：2026-10-14
> 覆盖模块：登录 / 发单 / 待接单 / 订单详情 / 我的单 / 我的 / API 鉴权层 / 状态流转端到端 / UI 兼容性
> 测试类型标记：**功能** / **边界** / **异常** / **回归** / **兼容** / **端到端**

---

## 一、登录模块（pages/login）

### 1.1 手机号输入 + 校验

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| LOGIN-001 | 空手机号提交 | 进入登录页 | 什么都不输入，直接点登录 | 登录按钮 disabled，点不动 | P0 | 功能 | `phoneValid=false → disabled` |
| LOGIN-002 | 1 位数字输入 | 进入登录页 | 输入 `1` | 按钮 disabled，无错误提示 | P1 | 边界 | 正则不匹配但未 blur |
| LOGIN-003 | 10 位数字输入 | 进入登录页 | 输入 `1381234567`（10位） | 输入中按钮 disabled；blur 后显示"请输入正确的手机号" shake 抖动 | P0 | 边界 | `/^1[3-9]\d{9}$/` 长度不足分支 |
| LOGIN-004 | 11 位合法手机号 | 进入登录页 | 输入 `13812348888` | 按钮变为可点击态，无错误提示 | P0 | 功能 | 正则匹配成功 |
| LOGIN-005 | 11 位首位不是 1 | 进入登录页 | 输入 `23812348888` | blur 后错误提示 + shake | P1 | 边界 | 正则首字符不匹配 |
| LOGIN-006 | 11 位第二位不是 3-9 | 进入登录页 | 输入 `12812348888` | blur 后错误提示 + shake | P1 | 边界 | 正则第二位不匹配 |
| LOGIN-007 | 输入非数字字符 | 进入登录页 | 输入 `138abc8888` | input type=number 自动拦截，不显示 | P2 | 边界 | 小程序原生 number type |
| LOGIN-008 | 输入 12 位数字 | 进入登录页 | 输入 `138123488889` | maxlength=11 截断，只保留前 11 位 | P1 | 边界 | `maxlength="11"` 截断 |
| LOGIN-009 | 清空按钮出现/消失 | 输入框有值 | 点击清空按钮 | 出现时弹入动画 clearPop；清空后按钮消失 | P1 | 功能 | `wx:if="{{phone}}"` |
| LOGIN-010 | focus 态下划线变主题色 | 输入框有值 | 点击聚焦手机号输入框 | field-bar 从灰变渐变橙色，高度 2→3rpx | P1 | 功能 | `.field.focus + .field-bar` |
| LOGIN-011 | blur 后校验失败 shake | 输入框有值但非法 | 输入 `138000`（7 位）→ blur | 输入框 shake 抖动一次（0.42s），420ms 后自动清 shake 状态 | P1 | 异常 | `onPhoneBlur` → `phoneShake=true` → setTimeout reset |

### 1.2 角色自动识别

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| LOGIN-012 | 普通学生识别 | 进入登录页 | 输入 `13812348888`（不以 1350000/1340000 开头） | detectRole 返回 `{role:'user', openid:'student001'}` | P0 | 功能 | `detectRole` 默认分支 |
| LOGIN-013 | 跑腿员识别 | 进入登录页 | 输入 `13500000001`（前7位=1350000） | detectRole 返回 `{role:'runner', openid:'runner001'}` | P0 | 功能 | `prefix === '1350000'` 分支 |
| LOGIN-014 | 管理员识别 | 进入登录页 | 输入 `13400000000`（前7位=1340000） | detectRole 返回 `{role:'admin', openid:'admin001'}` | P1 | 功能 | `prefix === '1340000'` 分支 |
| LOGIN-015 | 边界：前7位刚好到 1350000 | 进入登录页 | 输入 `1350000xxxxx` | 识别为跑腿员 | P0 | 边界 | `phone.startsWith('1350000')` |
| LOGIN-016 | 边界：前 6 位匹配但第 7 位不同 | 进入登录页 | 输入 `1350001xxxxx` | 识别为普通学生 | P1 | 边界 | `startsWith('1350000')` false |
| LOGIN-017 | 长度不足 7 位 | 进入登录页 | 输入 `135000`（6 位） | detectRole 返回默认 `{role:'user'}` | P2 | 边界 | `if (!phone \|\| phone.length < 7)` |

### 1.3 验证码流程

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| LOGIN-018 | 未输入手机号点获取验证码 | 进入登录页，手机号为空 | 点「获取验证码」 | toast "请先输入正确的手机号" | P0 | 异常 | `!phoneValid` 分支 |
| LOGIN-019 | 手机号合法获取验证码 | 输入合法手机号 | 点「获取验证码」 | toast 显示开发阶段验证码（runner001→000001 等），按钮变成 60s 倒计时 | P0 | 功能 | `phoneValid=true` → `codeCountdown=60` |
| LOGIN-020 | 倒计时中不可再次获取 | 正在倒计时 | 再次点按钮 | 按钮 disabled，显示 `codeCountdown + 's'` | P0 | 功能 | `codeCountdown > 0` → `.disabled` |
| LOGIN-021 | 倒计时结束恢复获取 | 倒计时中 | 等 60s | 按钮恢复「获取验证码」 | P1 | 边界 | `clearInterval` → `codeCountdown=0` |
| LOGIN-022 | 验证码输入不满 6 位 | 进入登录页 | 输入 5 位验证码 | `codeValid=false`，按钮 disabled | P1 | 边界 | `code.length === 6` |
| LOGIN-023 | 验证码输入满 6 位 | 进入登录页 | 输入 6 位验证码 | `codeValid=true`（其他条件满足时）按钮可点 | P1 | 功能 | `code.length === 6` |

### 1.4 登录提交

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| LOGIN-024 | 未勾选协议点登录 | 进入登录页 | 手机号/验证码都合法，协议未勾选 | toast "请先同意用户协议" | P0 | 异常 | `!agreed` 分支 |
| LOGIN-025 | 协议勾选框点击 | 进入登录页 | 点击协议框 hit-area（88rpx 触控区） | agreed 状态切换；on 态显示橙色 ✓ | P0 | 功能 | `toggleAgree()` |
| LOGIN-026 | 全部条件满足登录成功 | 手机号合法 + 验证码6位 + 协议已勾选 | 点登录按钮 | loading 态 → toast "欢迎，xxx" → 按角色跳转 TabBar（runner→pending, user→publish） | P0 | 功能 | `onPhoneLogin` 主流程 |
| LOGIN-027 | 登录中防重复点击 | 正在登录（loggingIn=true） | 快速连点登录按钮 | `if (this.data.loggingIn) return` 拦截，不会重复请求 | P0 | 异常 | `loggingIn` 锁 |
| LOGIN-028 | 登录失败后端异常 | mock 后端挂掉 | 点登录按钮 | toast "登录失败，请检查后端" | P1 | 异常 | `onPhoneLogin catch` |
| LOGIN-029 | 测试账号弹窗 | 进入登录页 | 点「🔑 测试账号」 | 半屏 sheet 弹出，显示 3 种角色测试手机号 | P2 | 功能 | `showPhonePanel` / `hidePhonePanel` |

### 1.5 微信登录 Tab

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| LOGIN-030 | Tab 切换 | 进入登录页 | 点「微信登录」Tab | card-bd 内容切换，淡入动画 bdFadeIn（因 wx:if 重建自动触发） | P0 | 功能 | `mode='wx'` → `wx:if` 重建 |
| LOGIN-031 | 微信登录按钮未勾选协议 | Tab 已切到微信登录 | 协议未勾选时点微信登录按钮 | button disabled（`disabled="{{!agreed \|\| loggingIn}}"`） | P0 | 异常 | `!agreed` disabled 分支 |
| LOGIN-032 | 微信登录按钮点击态 | 协议已勾选 | 点击微信登录按钮 | scale(0.97) + 阴影收窄，松开恢复 | P1 | 功能 | `.btn-wx:active` |

### 1.6 已登录自动跳转

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| LOGIN-033 | 已有 token + userInfo | 本地 Storage 有 token 和 userInfo | 冷启动小程序 | 直接跳对应 TabBar（runner→pending, user→publish），不显示登录页 | P0 | 功能 | `onLoad` → `redirectByRole` |

---

## 二、发单模块（pages/publish）

### 2.1 驿站选择

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| PUB-001 | 默认选中第一个驿站 | 进入发单页 | 不操作 | stationIdx=0，显示第一个驿站 | P0 | 功能 | `stationIdx: 0` |
| PUB-002 | 切换驿站 | 进入发单页 | 用 Picker 选第二个驿站 | stationIdx 更新，驿站名显示正确 | P0 | 功能 | `onStationChange` |
| PUB-003 | 驿站接口失败 fallback | mock api.getStations 返回 500 | 进入发单页 | 使用硬编码 3 个驿站（顺丰驿站/京东自提柜/菜鸟驿站） | P1 | 异常 | `getStations().catch` fallback |

### 2.2 添加快递

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| PUB-004 | 手动添加快递-成功 | 进入发单页 | 点「+ 添加快递」→ 选快递公司 → 填取件码（非空）→ 填尾号（非空）→ 选包裹类型 → 确认 | 卡片列表新增一个快递，价格按 pricing[type] 自动填充（small=3/mid=5/big=10/urgent=15） | P0 | 功能 | `confirmAddPackage` |
| PUB-005 | 取件码为空校验 | 进入添加 sheet | 取件码留空直接点确认 | toast "请填写取件码" | P0 | 异常 | `!tempCode` 分支 |
| PUB-006 | 尾号为空校验 | 取件码已填 | 尾号留空直接点确认 | toast "请填写手机尾号" | P0 | 异常 | `!tempTail` 分支 |
| PUB-007 | 模拟扫码入口 | 进入添加 sheet | 点「模拟扫码」→ 弹窗确认 → 确认 | 自动填入 SF-3xxx 取件码、默认尾号、mid 类型、"运动鞋鞋盒"名称 | P1 | 功能 | `chooseScan` mock 分支 |
| PUB-008 | 默认尾号自动填充 | 用 13812348888 登录 | 进入发单页 → 添加快递 | tempTail 默认 = 用户手机后 4 位 `8888` | P1 | 功能 | `phone.replace(/.*(\d{4})$/, '$1')` |
| PUB-009 | 包裹类型胶囊切换 | 在添加 sheet | 依次点 4 种包裹类型 | tempPtype 切换，价格标签实时变化 | P0 | 功能 | `pickPtype` + `pricing[tempPtype]` |
| PUB-010 | 删除已添加快递 | 已有 2 个快递 | 点其中一个卡片的删除 | 卡片消失，总价重新计算 | P0 | 功能 | `removePackage` + `recalcTotal` |
| PUB-011 | 删除全部快递 | 已有 1 个快递 | 删除后 | packages=[]，总价=0，pkgCount=0 | P1 | 边界 | `recalcTotal reduce([])` |

### 2.3 地址 + 备注 + ETA

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| PUB-012 | 地址自动记忆 | 上次发单填了"3号宿舍楼 502" | 再次进入发单页 | address 自动填入上次值 | P1 | 功能 | `store.get('lastAddress')` |
| PUB-013 | 地址校验-为空 | 快递已添加，地址为空 | 点「立即发布」 | toast "请填写送达地址" | P0 | 异常 | `!address` 分支 |
| PUB-014 | 备注可空 | 备注为空 | 发布时自动填空字符串 | note: '' 传给后端 | P2 | 边界 | `note: note \|\| ''` |
| PUB-015 | ETA 默认值 | 进入发单页 | 不操作 | 默认选中"立即送达" = 当前时间 + 60 分钟 | P1 | 功能 | `quick = now + 60min` |
| PUB-016 | ETA 时段选择 | 进入 ETA sheet | 点「明天 10:00 - 11:00」 | etaDisplay 更新为"明天 X/XX 10:00 - 11:00" | P1 | 功能 | `pickEta` groups 分支 |
| PUB-017 | ETA 时段过滤过去时间 | 当前 21:30 | 进入 ETA sheet | 今天 22:00 之后的 slot 才出现（<= now+30min 的 slot 被 makeSlot 过滤掉） | P1 | 边界 | `start <= now + 30min → null` |
| PUB-018 | ETA 传给后端 | 选好 ETA + 发布 | 检查 request payload | `estimatedTime: etaDate + 'T' + etaTime` | P0 | 功能 | `submitOrder → req.estimatedTime` |

### 2.4 提交订单

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| PUB-019 | 无快递直接提交 | 快递列表为空 | 点「立即发布」 | toast "请至少添加一个快递" | P0 | 异常 | `packages.length === 0` |
| PUB-020 | 正常提交 | 至少 1 个快递 + 地址 + 协议已勾选 | 点「立即发布」→ 弹窗确认 | loading → toast "发布成功！" → 800ms 后跳「我的单」页，表单清空 | P0 | 功能 | `doCreateOrder` 主流程 |
| PUB-021 | 支付弹窗取消 | 填写完整 | 点「立即发布」→ 弹窗点取消 | 停留在编辑态，不创建订单 | P1 | 边界 | `!r.confirm` return |
| PUB-022 | 提交失败 | mock 后端挂掉 | 点「立即发布」→ 确认 | toast "发布失败" | P1 | 异常 | `doCreateOrder catch` |
| PUB-023 | 总价计算-累加 | 添加 3 个快递（small×1 mid×1 big×1） | 看总价卡片 | 3 + 5 + 10 = ¥18 | P0 | 功能 | `recalcTotal reduce` |
| PUB-024 | 总价-含急件 | small×1 + urgent×1 | 看总价 | 3 + 15 = ¥18 | P0 | 边界 | urgent=15 定价验证 |

---

## 三、待接单模块（pages/pending）

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| PEND-001 | 非跑腿员看不到待接单 Tab | 用 user 角色登录 | 看自定义 TabBar | 不显示"待接单"Tab，显示"发任务" | P0 | 功能 | custom-tab-bar role 分支 |
| PEND-002 | 跑腿员看到待接单列表 | 用 runner 登录 + 有 pending 订单 | 进待接单页 | grabList 显示所有 pending + takeMode≠assign 的订单 | P0 | 功能 | `api.getPending` → filter |
| PEND-003 | 抢单-成功 | 有 grab 模式 pending 单 | 点「立即抢单」 | toast "抢单成功！" → 800ms 后跳详情页 → 列表刷新移除该单 | P0 | 功能 | `grabOrder → acceptOrder → loadList` |
| PEND-004 | 抢单失败（已被别人抢走） | 多人同时抢同一单 | 点「立即抢单」 | 后端返回 4xx → toast 错误信息 → 列表刷新 | P1 | 异常 | `grabOrder catch` |
| PEND-005 | 接受派单 | 有 assign 模式订单 | 点「接受派单」 | assignList 移除，toast "已接受派单" | P1 | 功能 | `acceptAssign` |
| PEND-006 | 拒绝派单 | 有 assign 模式订单 | 点「拒绝」 | 调用 `cancelOrder` → 订单 cancelled | P2 | 功能 | `rejectAssign` |
| PEND-007 | 空状态 | 没有任何 pending 订单 | 进入待接单页 | 显示"暂时没有可抢的单"空态 | P1 | 边界 | grabList.length === 0 |
| PEND-008 | 时间标签显示 | 不同创建时间的订单 | 进待接单页 | <1min 显示"刚刚"；1-60min 显示"N分钟前"；>60min 显示"N小时前" | P1 | 功能 | `enrichOrder timeLabel` 分支 |
| PEND-009 | 取件码只显示第一个 | 订单有 3 个快递 | 看卡片 | firstCode 只显示第一个快递的取件码 | P2 | 边界 | `packages[0].code` |

---

## 四、订单详情模块（pages/detail）

### 4.1 状态头部 + 进度条

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| DETAIL-001 | 订单不存在 | 进入不存在的订单 id | 打开详情页 | toast "订单不存在" → 1s 后 navigateBack | P0 | 异常 | `!detail \|\| !detail.order` |
| DETAIL-002 | cancelled 订单进度条 | 订单 status=cancelled + refunded=true | 打开详情页 | 进度条头部插入「已取消·已退款」灰色节点，原 5 步全部 done=false, active=false | P0 | 功能 | `isCancelled=true` → flowSteps 头部 prepend |
| DETAIL-003 | pending 进度条 | 订单 status=pending | 打开详情页 | 第 1 步 active（蓝色高亮），后续 4 步灰色未完成 | P0 | 功能 | `curIdx=0 → active, done=false` |
| DETAIL-004 | accepted 进度条 | 订单 status=accepted | 打开详情页 | 第 1 步 done（绿色），第 2 步 active，后续灰色 | P1 | 功能 | `curIdx=1 → done=[true, active, false, false, false]` |
| DETAIL-005 | timeline 时间戳 | 订单有完整 timeline | 打开详情页 | 每步下方显示"今天 HH:mm" / "昨天 HH:mm" / "M月D日 HH:mm" | P1 | 功能 | `formatTime` 三分支 |

### 4.2 底部操作按钮权限矩阵

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| DETAIL-006 | 发单用户 + pending 能取消 | 用 user 登录，订单是我发的，status=pending | 打开详情页 | canCancel=true（底部显示取消按钮）；canAccept/canDeliver/canArrive/canConfirm 全 false | P0 | 功能 | `canCancel = (pending\|\|accepted) && isPublisher` |
| DETAIL-007 | 发单用户 + accepted 能取消 | 同上但 status=accepted | 打开详情页 | canCancel=true | P0 | 功能 | 同上 accepted 分支 |
| DETAIL-008 | 发单用户 + delivered 能确认签收 | 订单 status=delivered + 是我发的 | 打开详情页 | canConfirm=true | P0 | 功能 | `canConfirm = delivered && isPublisher` |
| DETAIL-009 | 发单用户 + 自己发的单不能接自己的单 | 我是发单用户（非 runner），订单 pending | 打开详情页 | canAccept=false（因为 isRunner=false） | P1 | 边界 | `canAccept = pending && isRunner && !isPublisher` |
| DETAIL-010 | 跑腿员 + pending + 不是自己发的 能接单 | 用 runner 登录，订单 pending + userId≠runner.openid | 打开详情页 | canAccept=true | P0 | 功能 | `canAccept` 三条件都满足 |
| DETAIL-011 | 跑腿员 + accepted + 自己接的 能取件 | runner 接的单，status=accepted + runnerId=我 | 打开详情页 | canDeliver=true | P0 | 功能 | `canDeliver = accepted && isRunner && isMyOrder` |
| DETAIL-012 | 跑腿员 + delivering + 自己接的 能送达 | status=delivering + isMyOrder | 打开详情页 | canArrive=true | P0 | 功能 | `canArrive = delivering && isRunner && isMyOrder` |
| DETAIL-013 | 跑腿员 + 别人接的单 看不到取件按钮 | runner 登录，但订单 runnerId≠我 | 打开别人接的单 | canDeliver/canArrive 全 false（`isMyOrder=false`） | P0 | 安全权限 | `isMyOrder` 拦截 |
| DETAIL-014 | cancelled 订单 所有按钮全消失 | 任意角色 + 订单 cancelled | 打开详情页 | canCancel/canAccept/canDeliver/canArrive/canConfirm 全 false | P0 | 功能 | 所有按钮逻辑都隐含 status 判断 |
| DETAIL-015 | completed 订单 所有按钮全消失 | 任意角色 + 订单 completed | 打开详情页 | 同上，按钮全 false | P0 | 功能 | 同上 |

### 4.3 取消订单弹窗分支

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| DETAIL-016 | 已付款订单取消 → 退款弹窗 | order.paid=true + refunded=false | 点取消 | 弹窗标题「确认取消并退款 ¥X」，内容含"自动退款" | P0 | 功能 | `if (order.paid && !order.refunded)` |
| DETAIL-017 | 未付款订单取消 → 普通弹窗 | order.paid=false | 点取消 | 弹窗标题「确定取消这个订单吗？」，内容"取消后无法恢复" | P1 | 功能 | else 分支 |
| DETAIL-018 | 取消成功刷新 | 点确认取消 | 等待 | toast "已取消" → loadOrder() → 状态变为 cancelled + refunded=true | P0 | 功能 | `api.cancelOrder → this.loadOrder()` |
| DETAIL-019 | 取消失败 | 后端挂了 | 点确认取消 | catch 静默 log，不 toast 也不 crash | P2 | 异常 | `doCancel catch` |

### 4.4 送达凭证

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| DETAIL-020 | 送达弹窗默认选项 | runner + delivering + isMyOrder | 点「已送达」 | 弹窗 confirmText="拍照凭证" cancelText="直接送达" | P0 | 功能 | `arrive()` wx.showModal |
| DETAIL-021 | 选择拍照凭证 | 弹窗出现 | 点确认 → wx.chooseMedia → 拍照/选图 | tempFilePath 传给 `doArrive(proofImg)` | P0 | 功能 | `takeProof → wx.chooseMedia success` |
| DETAIL-022 | 拍照取消 | wx.chooseMedia | 用户拒绝拍照/取消 | toast "拍照取消"，停留在弹窗前状态 | P1 | 异常 | `takeProof fail` |
| DETAIL-023 | 直接送达（无凭证） | 弹窗出现 | 点 cancelText="直接送达" | 调 `doArrive(null)` 不带图片 | P0 | 功能 | `r.cancel → doArrive()` |
| DETAIL-024 | 查看送达凭证图片 | 订单有 deliveryProof | 发单用户打开详情 | 显示 📷 图片卡片，点击全屏预览 | P1 | 功能 | `previewProof → wx.previewImage` |

### 4.5 取件码脱敏 + 联系对方

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| DETAIL-025 | 发单用户看取件码 🔒 | user 打开自己发的单 | 看包裹清单 | 显示「🔒 取件码已加密，仅跑腿员可见」，不显示真实码 | P0 | 安全权限 | 角色视图分支 |
| DETAIL-026 | 跑腿员看取件码完整 | runner 打开自己接的单 | 看包裹清单 | 完整显示取件码 + 手机尾号 | P0 | 安全权限 | 角色视图分支 |
| DETAIL-027 | 发单用户联系跑腿员 | 订单有 runnerId | 点「联系对方」 | 弹窗显示跑腿员昵称 + 脱敏手机号 | P1 | 功能 | `callRunner` isRunner=false 分支 |
| DETAIL-028 | 跑腿员联系发单用户 | runner 视角 | 点「联系对方」 | 弹窗显示发单用户昵称 + 手机号 | P1 | 功能 | `callRunner` isRunner=true 分支 |
| DETAIL-029 | 无对方手机号时的提示 | publisherPhone 为空 | 点「联系对方」 | toast "对方信息不存在" | P2 | 异常 | `!targetPhone` 分支 |

### 4.6 ETA 显示逻辑

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| DETAIL-030 | 已送达订单 ETA 显示 deliveredAt | order.status=delivered + deliveredAt 存在 | 打开详情 | etaText = formatTime(deliveredAt)，而非 estimatedTime | P1 | 功能 | `deliveredAt` 优先分支 |
| DETAIL-031 | 未送达订单 ETA 显示 estimatedTime | order.deliveredAt 为空 + estimatedTime 存在 | 打开详情 | etaText = formatTime(estimatedTime) | P1 | 功能 | `estimatedTime` fallback 分支 |
| DETAIL-032 | cancelled 订单不显示 ETA | status=cancelled | 打开详情 | showEta=false | P1 | 边界 | `if (order.status !== 'cancelled')` |
| DETAIL-033 | 急件标签识别 | 订单有 urgent 类型快递 | 打开详情 | isUrgent=true，标题栏显示 ⚡ 标识 | P2 | 边界 | `pkgs.some(p => p.ptype === 'urgent')` |

---

## 五、我的单模块（pages/my-orders）

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| MY-001 | 发单用户只看我发的 | user 登录 + 有订单 | 进入我的单 | 列表只显示 `userId === openid` 的订单 | P0 | 功能 | `getMine('user')` 后端过滤 |
| MY-002 | 跑腿员只看我接的 | runner 登录 + 有订单 | 进入我的单 | 列表只显示 `runnerId === openid` 的订单 | P0 | 功能 | `getMine('runner')` 后端过滤 |
| MY-003 | 发单用户标题含统计 | user 登录 + 3 个订单 | 进入我的单 | 标题 "我发的 · 共 3 单" | P1 | 功能 | 头部动态 count |
| MY-004 | 跑腿员标题含统计 | runner 登录 | 进入我的单 | 标题 "我接的 · 共 X 单" | P1 | 功能 | 同上 |
| MY-005 | 空状态 | 该角色无订单 | 进入我的单 | 显示空态引导 | P1 | 边界 | list.length === 0 |

---

## 六、我的模块（pages/profile）

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| PROFILE-001 | 发单用户个人信息 | user 登录 | 进入我的 | 角色标签显示"发单用户"；统计卡显示累计发单/完成；**不显示收入卡** | P0 | 功能 | `isRunner=false` |
| PROFILE-002 | 跑腿员个人信息 | runner 登录 | 进入我的 | 角色标签显示"跑腿员"；统计卡显示累计接单/评分/完成；**显示深色渐变收入卡** | P0 | 功能 | `isRunner=true` → `loadIncome()` |
| PROFILE-003 | 收入统计周/月/累计切换 | runner 登录 | 依次点 3 个 Tab | 分别调 `getIncome('week'/'month'/'total')`，switchPeriod 切换 incomeData | P0 | 功能 | `api.getIncome(period)` + `switchPeriod` |
| PROFILE-004 | 切换到跑腿员视角 | user 登录 | 点「切换为跑腿员视角」→ 确认 | toast "已切换为跑腿员视角" → 跳 pending 页 | P1 | 功能 | `switchToRunner` → `app.switchRole('runner')` |
| PROFILE-005 | 退出登录 | 已登录 | 点「退出登录」→ 确认 | 清 token + 清 userInfo → reLaunch 到 login | P0 | 功能 | `logout` → `wx.removeStorageSync × 2` |
| PROFILE-006 | 收入接口失败 | runner + 后端挂 | 进入我的 | loadIncome catch → console.error，不 crash，收入卡不显示 | P2 | 异常 | `loadIncome catch` |

---

## 七、API 通用层 / 鉴权（utils/api.js + app.js）

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 代码分支覆盖 |
|--------|----------|----------|----------|----------|--------|------|-------------|
| API-001 | 401 自动清 token + 跳登录 | token 过期 | 调任意 api | clearToken() → toast "登录已过期" → 800ms 后 wx.reLaunch 到 login | P0 | 功能 | `res.statusCode === 401` |
| API-002 | 网络错误 toast | 断网 | 调任意 api | wx.showToast({ title: '网络错误', icon: 'none' }) | P0 | 异常 | `wx.request fail` |
| API-003 | 后端非 200 code | 后端返回 `{code:500, msg:'xxx'}` | 调 api | reject(body) → 上层 catch | P1 | 异常 | `body.code !== 200` |
| API-004 | 无 token 请求 | 本地无 token | 调 api | header `Authorization: ''`（空字符串），不 crash | P0 | 边界 | `getToken() \|\| ''` |
| API-005 | requireLogin 拦截 | 未登录状态 | 直接访问 TabBar 页 | 跳转登录页 | P0 | 功能 | `app.requireLogin()` |
| API-006 | Debug 模式日志输出 | DEBUG=true | 调 api | console.log 输出 [API ➡️ / 📥 / ✅ / 📤] | P2 | 回归 | `if (DEBUG)` 分支 |

---

## 八、订单状态流转端到端

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 端到端路径 |
|--------|----------|----------|----------|----------|--------|------|-----------|
| E2E-001 | 完整 happy path（发单 → 抢单 → 取件 → 送达 → 签收） | 两个账号：user + runner | 1. user 登录 → 发单（2 个快递 ¥8）→ 确认支付<br>2. runner 登录 → 待接单 → 抢单 → 进详情 → 已取件开始运送 → 已送达（拍照凭证）<br>3. user 登录 → 我的单 → 进详情 → 确认签收 | 订单状态：pending → accepted → delivering → delivered → completed；每步 timeline 新增节点；runner 收入 +¥8 | P0 | 端到端 | 全链路 |
| E2E-002 | 发单后立即取消退款 | user 登录 + 有 pending 订单 | 进详情 → 取消 → 确认退款 | 状态 cancelled + refunded=true；进度条头部显示"已取消·已退款" | P0 | 端到端 | 取消退款路径 |
| E2E-003 | 已接单状态下取消 | user 登录 + 订单 accepted（runner 已接） | 进详情 → 取消 | 同样走退款弹窗；后端释放 runnerId | P1 | 端到端 | accepted 状态取消 |
| E2E-004 | 送达时直接送达无凭证 | runner + delivering | 点「已送达」→ 弹窗点"直接送达" | 状态 delivered；deliveryProof 为空；发单用户看不到图片卡片 | P1 | 端到端 | 直接送达分支 |
| E2E-005 | 登录切换角色后订单隔离 | user 发了 1 单 → 退出 → runner 登录 → 待接单看到这单 → runner 接了 | 切回 user 登录 | user 我的单看到 pending/accepted；runner 我的单看到同样的单（因 userId 和 runnerId 都匹配） | P1 | 端到端 | 角色隔离验证 |

---

## 九、UI / 交互 / 兼容性

| 用例ID | 测试场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 | 类型 | 备注 |
|--------|----------|----------|----------|----------|--------|------|------|
| UI-001 | Hero 装饰圆呼吸动画 | 登录页首屏 | 观察 10s | s1/s2/s3 三圆各以 6/10/8s 不同节奏缓慢缩放位移，s2 reverse，永远不同步 | P2 | 回归 | 视觉检查 |
| UI-002 | 卡片首屏入场动画 | 冷启动 | 进登录页 | cardIn 0.55s 从 y=32rpx 淡入上移；cubic-bezier(0.22,1,0.36,1) 缓动 | P2 | 回归 | 视觉检查 |
| UI-003 | Tab 切换 card-bd 淡入 | 登录页 | 切「账号登录」↔「微信登录」 | bdFadeIn 0.3s 淡入；wx:if 重建每次都触发 | P2 | 回归 | 视觉检查 |
| UI-004 | 主按钮点击态 | 登录按钮可点 | 长按松开 | scale(0.97) + 阴影收窄，松开 0.12s 回弹 | P1 | 功能 | .btn-login:active |
| UI-005 | 清空按钮弹入 | 输入框出现清空按钮 | 第一次输入有值 | clearPop 0.22s，带 overshoot | P2 | 回归 | 视觉检查 |
| UI-006 | 勾选框触控区大小 | 登录页协议框 | 用手指/鼠标点 88rpx 范围任意处 | 都能切换勾选状态 | P0 | 兼容 | Apple HIG 44pt 验证 |
| UI-007 | 协议文字对比度 | 白底 | 看协议文字 `#666` | Chrome DevTools 对比度 ≥ 5.7:1（WCAG AA 通过） | P1 | 兼容 | 可访问性 |
| UI-008 | iPhone 安全区适配 | iPhone X+ 机型 | 看底部 sheet 和退出按钮 | 底部有 env(safe-area-inset-bottom) padding | P1 | 兼容 | iOS 全面屏 |
| UI-009 | 橙色渐变 Hero 在深色模式 | 系统深色模式 | 进登录页 | 导航栏白色文字不糊；Hero 渐变色对比度 OK | P2 | 兼容 | 深色模式 |
| UI-010 | 网络不好时 loading 不消失 | 断网 | 点立即发布 | loading 不消失（因为 await 失败 catch 里有 wx.hideLoading） | P1 | 异常 | `doCreateOrder catch` 有 wx.hideLoading |

---

## 附录 A：测试账号速查

| 角色 | 手机号前缀 | openid | 登录后跳转到 |
|------|-----------|--------|-------------|
| 发单用户 | `138xxxx / 139xxxx` | `student001` | pages/publish |
| 跑腿员 | `1350000xxx` | `runner001` | pages/pending |
| 管理员 | `1340000xxx` | `admin001` | pages/publish |

## 附录 B：定价速查

| ptype | 价格 |
|-------|------|
| small | ¥3 |
| mid | ¥5 |
| big | ¥10 |
| urgent | ¥15 |

## 附录 C：订单状态机可达性验证矩阵

```
from \ to     pending  accepted  delivering  delivered  completed  cancelled
pending        -        ✅(runner)       ✗           ✗          ✗       ✅(publisher)
accepted       ✗         -        ✅(runner+mine)  ✗          ✗       ✅(publisher)
delivering     ✗         ✗         -        ✅(runner+mine)    ✗           ✗
delivered      ✗         ✗         ✗          -          ✅(publisher)    ✗
completed      ✗         ✗         ✗          ✗           -            ✗
cancelled      ✗         ✗         ✗          ✗           ✗            -
```

## 附录 D：优先级说明

| 级别 | 含义 | 本轮必须覆盖 |
|------|------|-------------|
| P0 | 主流程 / 安全 / 崩溃级缺陷 | 是 |
| P1 | 重要分支 / 边界条件 / 用户体验 | 建议覆盖 |
| P2 | 低频路径 / 视觉动画 / 回归 | 可选 |
