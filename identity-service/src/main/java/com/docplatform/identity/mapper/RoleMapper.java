package com.docplatform.identity.mapper;

import com.docplatform.identity.dto.user.RoleResponse;
import com.docplatform.identity.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    RoleResponse toResponse(Role role);

    @Mapping(target = "id", ignore = true)
    Role toEntity(RoleResponse response);

    List<RoleResponse> toResponseList(List<Role> roles);
}
