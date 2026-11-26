package com.errand.dto.req;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderReq {
    @NotBlank
    private String stationId;
    @NotBlank
    private String stationName;
    private String stationAddr;
    @NotBlank
    private String address;
    private String note;
    @NotNull
    private BigDecimal total;
    @NotEmpty
    private List<PackageItem> packages;

    @Data
    public static class PackageItem {
        private String express;
        private String code;
        private String tail;
        private String ptype;
        private BigDecimal price;
        private String name;
    }
}
