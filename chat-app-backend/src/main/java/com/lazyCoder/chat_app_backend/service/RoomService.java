package com.lazyCoder.chat_app_backend.service;

import com.lazyCoder.chat_app_backend.dto.RoomRequestDTO;

import com.lazyCoder.chat_app_backend.exception.RoomAlreadyExistException;
import com.lazyCoder.chat_app_backend.exception.RoomNotFoundException;
import com.lazyCoder.chat_app_backend.model.Message;
import com.lazyCoder.chat_app_backend.model.Room;
import com.lazyCoder.chat_app_backend.repo.MessageRepo;
import com.lazyCoder.chat_app_backend.repo.RoomRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class RoomService {

    private final RoomRepo roomRepo;
    private final MessageRepo messageRepo;

    @Autowired
    public RoomService(RoomRepo roomRepo, MessageRepo messageRepo) {
        this.messageRepo = messageRepo;
        this.roomRepo = roomRepo;
    }

    // Create room Service
    public Room createRoom (RoomRequestDTO roomRequestDTO, String username) {

        if(roomRepo.existsByRoomId(roomRequestDTO.getRoomId())) {
            throw  new RoomAlreadyExistException("Room with ID " + roomRequestDTO.getRoomId() + " already exists.");
        }

        Room room = Room.builder()
                .roomId(roomRequestDTO.getRoomId())
                .createdBy(username)
                .build();
        roomRepo.save(room);
        return room;
    }

    // Get room
    public Room findRoom(String roomId) {

        return roomRepo.findByRoomId(roomId).orElseThrow(
                () -> new RoomNotFoundException("Room with ID " + roomId + " not found.")
        );

    }

    // Read (Paginated message)
    public Page<Message> getRoomMessages(String roomId, int page, int pageSize) {

        if (!roomRepo.existsByRoomId(roomId)) {
            throw  new RoomNotFoundException("Room with ID " + roomId + " not found.");
        }

        PageRequest pageRequest = PageRequest.of(page, pageSize);

        return messageRepo.findByRoomIdOrderByTimeStampDesc(roomId, pageRequest);
    }

    @Transactional
    public void deleteRoom(String roomId, String username) {

        Room room = roomRepo.findByRoomId(roomId).orElseThrow(
                () -> new RoomNotFoundException("Room with ID " + roomId + " not found.")
        );

        if (room.getCreatedBy() != null && !room.getCreatedBy().equals(username)) {
            throw new AccessDeniedException("Only the room creator can delete this room");
        }

        if (room.getId() != null) {
            messageRepo.deleteByRoomId(room.getId());
        }

        roomRepo.delete(room);
    }


    public List<Room> getRoomsByCreator(String username) {
        return roomRepo.findByCreatedBy(username);
    }
}

