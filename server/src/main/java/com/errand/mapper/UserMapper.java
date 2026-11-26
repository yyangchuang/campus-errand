package com.errand.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.errand.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
