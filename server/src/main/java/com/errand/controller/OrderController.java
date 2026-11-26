package com.errand.controller;

import com.errand.common.Result;
import com.errand.dto.req.CreateOrderReq;
import com.errand.entity.Order;
import com.errand.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired private OrderService orderService;

    @PostMapping
    public Result<Order> create(@Valid @RequestBody CreateOrderReq req,
                                HttpServletRequest httpReq) {
        Long userId = (Long) httpReq.getAttribute("userId");
        return Result.ok(orderService.create(userId, req));
    }

    @GetMapping("/pending")
    public Result<List<Order>> pending() {
        return Result.ok(orderService.getPending());
    }

    @GetMapping("/mine")
    public Result<List<Order>> mine(@RequestParam String role,
                                     HttpServletRequest httpReq) {
        Long userId = (Long) httpReq.getAttribute("userId");
        Long openidAsLong = userId;
        if ("runner".equals(role)) {
            return Result.ok(orderService.getByRunner(openidAsLong));
        }
        return Result.ok(orderService.getByUser(userId));
    }

    @GetMapping("/{id}")
    public Result<Map<String, Object>> detail(@PathVariable String id) {
        return Result.ok(orderService.getDetail(id));
    }

    @PostMapping("/{id}/accept")
    public Result<?> accept(@PathVariable String id, HttpServletRequest httpReq) {
        Long runnerId = (Long) httpReq.getAttribute("userId");
        orderService.accept(id, runnerId);
        return Result.ok();
    }

    @PostMapping("/{id}/pickup")
    public Result<?> pickup(@PathVariable String id, HttpServletRequest httpReq) {
        Long runnerId = (Long) httpReq.getAttribute("userId");
        orderService.pickup(id, runnerId);
        return Result.ok();
    }

    @PostMapping("/{id}/deliver")
    public Result<?> deliver(@PathVariable String id,
                             @RequestBody(required = false) Map<String, String> body,
                             HttpServletRequest httpReq) {
        Long runnerId = (Long) httpReq.getAttribute("userId");
        String proof = body != null ? body.get("proof") : null;
        orderService.deliver(id, runnerId, proof);
        return Result.ok();
    }

    @PostMapping("/{id}/confirm")
    public Result<?> confirm(@PathVariable String id, HttpServletRequest httpReq) {
        Long userId = (Long) httpReq.getAttribute("userId");
        orderService.confirm(id, userId);
        return Result.ok();
    }

    @PostMapping("/{id}/cancel")
    public Result<?> cancel(@PathVariable String id, HttpServletRequest httpReq) {
        Long userId = (Long) httpReq.getAttribute("userId");
        String role = (String) httpReq.getAttribute("role");
        orderService.cancel(id, userId, role);
        return Result.ok();
    }
}
