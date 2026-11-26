package com.errand.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("package")
public class ExpressPackage {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderId;
    private String express;
    private String code;
    private String tail;
    private String ptype;
    private BigDecimal price;
    private String name;
    private LocalDateTime createdAt;
}
