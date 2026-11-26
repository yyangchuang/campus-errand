package com.errand.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("orders")
public class Order {
    @TableId
    private String id;
    private Long userId;
    private Long runnerId;
    private String stationId;
    private String stationName;
    private String stationAddr;
    private String address;
    private String note;
    private BigDecimal total;
    private String status;
    private String takeMode;
    private Boolean paid;
    private LocalDateTime paidAt;
    private String payMethod;
    private Boolean refunded;
    private LocalDateTime refundAt;
    private String deliveryProof;
    private LocalDateTime deliveredAt;
    private LocalDateTime estimatedTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
