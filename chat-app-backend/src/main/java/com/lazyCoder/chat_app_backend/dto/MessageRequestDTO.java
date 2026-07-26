package com.lazyCoder.chat_app_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageRequestDTO {

    @NotBlank(message = "Room Id cannot be blank")
    private String roomId;

    @NotBlank(message = "Sender cannot be blank")
    @Size(max = 50, message = "Sender name too long")
    private String sender;

    @NotBlank(message = "Message cannot be blank")
    @Size(max = 200, message = "Message name too long")
    private String content;

}
