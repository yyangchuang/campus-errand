package com.errand.controller;

import com.errand.common.Result;
import com.errand.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/runner")
public class RunnerController {
    @Autowired
    private OrderService orderService;

    @GetMapping("/income")
    public Result<Map<String, Object>> income(@RequestParam(defaultValue = "week") String period,
                                              HttpServletRequest httpReq) {
        Long runnerId = (Long) httpReq.getAttribute("userId");
        return Result.ok(orderService.getIncome(runnerId, period));
    }
}
