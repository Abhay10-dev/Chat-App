package com.lazyCoder.chat_app_backend.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomRequestDTO {

    @NotEmpty(message = "Room Id cannot be empty")
    private String roomId;

}
