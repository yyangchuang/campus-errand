package com.errand.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.errand.common.BizException;
import com.errand.dto.req.CreateOrderReq;
import com.errand.entity.*;
import com.errand.mapper.*;
import com.errand.mapper.ExpressPackageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class OrderService {

    @Autowired private OrderMapper orderMapper;
    @Autowired private ExpressPackageMapper expressPackageMapper;
    @Autowired private OrderTimelineMapper timelineMapper;
    @Autowired private UserMapper userMapper;
    @Autowired private StationMapper stationMapper;

    @Transactional
    public Order create(Long userId, CreateOrderReq req) {
        Order o = new Order();
        o.setId(generateOrderId());
        o.setUserId(userId);
        o.setStationId(req.getStationId());
        o.setStationName(req.getStationName());
        String addr = req.getStationAddr();
        if (addr == null || addr.isBlank()) {
            Station s = stationMapper.selectById(req.getStationId());
            if (s != null && s.getAddr() != null) addr = s.getAddr();
        }
        o.setStationAddr(addr);
        o.setAddress(req.getAddress());
        o.setNote(req.getNote());
        o.setTotal(req.getTotal());
        o.setStatus("pending");
        o.setTakeMode("grab");
        o.setPaid(true);
        o.setPaidAt(LocalDateTime.now());
        o.setPayMethod("wechat");
        o.setRefunded(false);
        orderMapper.insert(o);

        for (CreateOrderReq.PackageItem p : req.getPackages()) {
            ExpressPackage pkg = new ExpressPackage();
            pkg.setOrderId(o.getId());
            pkg.setExpress(p.getExpress());
            pkg.setCode(p.getCode());
            pkg.setTail(p.getTail());
            pkg.setPtype(p.getPtype());
            pkg.setPrice(p.getPrice());
            pkg.setName(p.getName());
            expressPackageMapper.insert(pkg);
        }

        addTimeline(o.getId(), "pending", "订单已发布");
        return orderMapper.selectById(o.getId());
    }

    public List<Order> getPending() {
        return orderMapper.selectList(
            new LambdaQueryWrapper<Order>()
                .eq(Order::getStatus, "pending")
                .orderByDesc(Order::getCreatedAt)
        );
    }

    public List<Order> getByUser(Long userId) {
        return orderMapper.selectList(
            new LambdaQueryWrapper<Order>()
                .eq(Order::getUserId, userId)
                .orderByDesc(Order::getCreatedAt)
        );
    }

    public List<Order> getByRunner(Long runnerId) {
        return orderMapper.selectList(
            new LambdaQueryWrapper<Order>()
                .eq(Order::getRunnerId, runnerId)
                .orderByDesc(Order::getCreatedAt)
        );
    }

    public Map<String, Object> getDetail(String orderId) {
        Order o = orderMapper.selectById(orderId);
        if (o == null) throw new BizException(404, "订单不存在");

        List<ExpressPackage> packages = expressPackageMapper.selectList(
            new LambdaQueryWrapper<ExpressPackage>().eq(ExpressPackage::getOrderId, orderId)
        );
        List<OrderTimeline> timeline = timelineMapper.selectList(
            new LambdaQueryWrapper<OrderTimeline>()
                .eq(OrderTimeline::getOrderId, orderId)
                .orderByAsc(OrderTimeline::getCreatedAt)
        );

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("order", o);
        result.put("packages", packages);
        result.put("timeline", timeline);

        if (o.getRunnerId() != null) {
            User runner = userMapper.selectById(o.getRunnerId());
            if (runner != null) result.put("runnerName", runner.getNickname());
        }
        return result;
    }

    @Transactional
    public void accept(String orderId, Long runnerId) {
        Order o = orderMapper.selectById(orderId);
        if (o == null) throw new BizException(404, "订单不存在");
        if (!"pending".equals(o.getStatus())) throw new BizException(400, "订单已被接单");

        o.setStatus("accepted");
        o.setRunnerId(runnerId);
        orderMapper.updateById(o);
        addTimeline(orderId, "accepted", "跑腿员已接单");
    }

    @Transactional
    public void pickup(String orderId, Long runnerId) {
        Order o = orderMapper.selectById(orderId);
        if (o == null) throw new BizException(404, "订单不存在");
        if (!"accepted".equals(o.getStatus())) throw new BizException(400, "状态不允许");
        if (!runnerId.equals(o.getRunnerId())) throw new BizException(403, "无权操作");

        o.setStatus("delivering");
        orderMapper.updateById(o);
        addTimeline(orderId, "delivering", "跑腿员已取件，开始运送");
    }

    @Transactional
    public void deliver(String orderId, Long runnerId, String proof) {
        Order o = orderMapper.selectById(orderId);
        if (o == null) throw new BizException(404, "订单不存在");
        if (!"delivering".equals(o.getStatus())) throw new BizException(400, "状态不允许");
        if (!runnerId.equals(o.getRunnerId())) throw new BizException(403, "无权操作");

        o.setStatus("delivered");
        o.setDeliveryProof(proof);
        o.setDeliveredAt(LocalDateTime.now());
        orderMapper.updateById(o);
        addTimeline(orderId, "delivered", "跑腿员已送达");
    }

    @Transactional
    public void confirm(String orderId, Long userId) {
        Order o = orderMapper.selectById(orderId);
        if (o == null) throw new BizException(404, "订单不存在");
        if (!"delivered".equals(o.getStatus())) throw new BizException(400, "状态不允许");
        if (!userId.equals(o.getUserId())) throw new BizException(403, "无权操作");

        o.setStatus("completed");
        orderMapper.updateById(o);
        addTimeline(orderId, "completed", "发单用户已确认签收");
    }

    @Transactional
    public void cancel(String orderId, Long userId, String role) {
        Order o = orderMapper.selectById(orderId);
        if (o == null) throw new BizException(404, "订单不存在");
        if ("completed".equals(o.getStatus()) || "cancelled".equals(o.getStatus()))
            throw new BizException(400, "订单已结束");

        boolean canCancel = userId.equals(o.getUserId()) || "admin".equals(role);
        if (!canCancel) throw new BizException(403, "无权取消");

        o.setStatus("cancelled");
        if (o.getPaid() != null && o.getPaid()) {
            o.setRefunded(true);
            o.setRefundAt(LocalDateTime.now());
        }
        orderMapper.updateById(o);
        addTimeline(orderId, "cancelled", "订单已取消" + (o.getRefunded() ? "，已退款" : ""));
    }

    public Map<String, Object> getIncome(Long runnerId, String period) {
        List<Order> all = orderMapper.selectList(
            new LambdaQueryWrapper<Order>()
                .eq(Order::getRunnerId, runnerId)
                .eq(Order::getStatus, "completed")
                .isNotNull(Order::getDeliveredAt)
                .orderByDesc(Order::getDeliveredAt)
        );

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;
        if ("week".equals(period)) {
            start = now.with(java.time.DayOfWeek.MONDAY).truncatedTo(ChronoUnit.DAYS);
        } else if ("month".equals(period)) {
            start = now.withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
        } else {
            start = LocalDateTime.of(2000, 1, 1, 0, 0);
        }

        List<Order> filtered = new ArrayList<>();
        for (Order o : all) {
            if (o.getDeliveredAt() != null && !o.getDeliveredAt().isBefore(start)) {
                filtered.add(o);
            }
        }

        BigDecimal total = filtered.stream()
            .map(Order::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("period", period);
        r.put("orderCount", filtered.size());
        r.put("totalIncome", total);
        r.put("orders", filtered);
        return r;
    }

    private void addTimeline(String orderId, String status, String remark) {
        OrderTimeline t = new OrderTimeline();
        t.setOrderId(orderId);
        t.setStatus(status);
        t.setRemark(remark);
        timelineMapper.insert(t);
    }

    private String generateOrderId() {
        LocalDateTime now = LocalDateTime.now();
        String base = "E" + now.getYear()
            + String.format("%02d", now.getMonthValue())
            + String.format("%02d", now.getDayOfMonth())
            + String.format("%02d", now.getHour())
            + String.format("%02d", now.getMinute());
        return base + String.format("%03d", new Random().nextInt(1000));
    }
}
