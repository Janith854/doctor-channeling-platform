package com.docplatform.schedule.dto.request;

import com.docplatform.schedule.entity.SlotStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private SlotStatus status;
}
