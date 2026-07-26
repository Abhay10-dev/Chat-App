package com.lazyCoder.chat_app_backend.service;

import com.lazyCoder.chat_app_backend.dto.MessageRequestDTO;
import com.lazyCoder.chat_app_backend.exception.RoomNotFoundException;
import com.lazyCoder.chat_app_backend.model.Message;
import com.lazyCoder.chat_app_backend.model.Room;
import com.lazyCoder.chat_app_backend.repo.MessageRepo;
import com.lazyCoder.chat_app_backend.repo.RoomRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import java.time.Instant;

@Service
public class ChatMessageService {

    private final RoomRepo roomRepo;
    private final MessageRepo messageRepo;

    @Autowired
    public ChatMessageService(RoomRepo roomRepo, MessageRepo messageRepo) {
        this.messageRepo = messageRepo;
        this.roomRepo = roomRepo;
    }


    @Transactional
    public Message sendMessage(MessageRequestDTO messageRequestDTO) {

        Room room = roomRepo.findByRoomId(messageRequestDTO.getRoomId()).orElseThrow(
                () -> new RoomNotFoundException("Room with ID " + messageRequestDTO.getRoomId() + " not found.")
        );

        // Sanitize content against XSS script injection
        String cleanContent = HtmlUtils.htmlEscape(messageRequestDTO.getContent().trim());

        Message messageBuilder = Message.builder()
                .roomId(room.getId())
                .sender(messageRequestDTO.getSender().trim())
                .content(cleanContent)
                .timeStamp(Instant.now())
                .build();

        return messageRepo.save(messageBuilder);
    }
}
