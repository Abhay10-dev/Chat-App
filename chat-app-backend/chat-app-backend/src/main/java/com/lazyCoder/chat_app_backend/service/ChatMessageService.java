package com.lazyCoder.chat_app_backend.service;

import com.lazyCoder.chat_app_backend.dto.MessageRequestDTO;
import com.lazyCoder.chat_app_backend.exception.RoomNotFoundException;
import com.lazyCoder.chat_app_backend.model.Message;
import com.lazyCoder.chat_app_backend.model.Room;
import com.lazyCoder.chat_app_backend.repo.RoomRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ChatMessageService {

    private final RoomRepo  roomRepo;

    public ChatMessageService(RoomRepo roomRepo) {
        this.roomRepo = roomRepo;
    }


    public Message sendMessage(MessageRequestDTO messageRequestDTO) {

        Room room = roomRepo.findByRoomId(messageRequestDTO.getRoomId());

        Message message = new Message();

        message.setSender(messageRequestDTO.getSender());
        message.setContent(messageRequestDTO.getContent());
        message.setTimeStamp(LocalDateTime.now());

        if (room != null) {
            room.getMessages().add(message);
            roomRepo.save(room);
        } else {
            throw new RoomNotFoundException("Room with the Id "+ messageRequestDTO.getRoomId() + " not found!");
        }

        return message;
    }
}
