package com.errand.controller;

import com.errand.common.Result;
import com.errand.entity.Station;
import com.errand.mapper.StationMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
public class StationController {
    @Autowired
    private StationMapper stationMapper;

    @GetMapping
    public Result<List<Station>> list() {
        return Result.ok(stationMapper.selectList(null));
    }
}
