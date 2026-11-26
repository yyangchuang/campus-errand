package com.errand.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("order_timeline")
public class OrderTimeline {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderId;
    private String status;
    private String remark;
    private LocalDateTime createdAt;
}
