package com.lazyCoder.chat_app_backend.controller;

import com.lazyCoder.chat_app_backend.dto.MessageRequestDTO;
import com.lazyCoder.chat_app_backend.model.Message;
import com.lazyCoder.chat_app_backend.service.ChatMessageService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    public ChatMessageController(ChatMessageService chatMessageService) {
        this.chatMessageService = chatMessageService;
    }

    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(
            @DestinationVariable String roomId,
            MessageRequestDTO messageRequestDTO,
            Principal principal) {

        messageRequestDTO.setRoomId(roomId);
        if (principal != null && principal.getName() != null) {
            messageRequestDTO.setSender(principal.getName());
        }

        return chatMessageService.sendMessage(messageRequestDTO);
    }
}

