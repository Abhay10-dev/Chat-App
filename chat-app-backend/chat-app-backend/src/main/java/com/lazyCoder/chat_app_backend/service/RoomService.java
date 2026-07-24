package com.lazyCoder.chat_app_backend.service;

import com.lazyCoder.chat_app_backend.dto.RoomRequestDTO;
import com.lazyCoder.chat_app_backend.exception.RoomAlreadyExistException;
import com.lazyCoder.chat_app_backend.exception.RoomNotFoundException;
import com.lazyCoder.chat_app_backend.model.Message;
import com.lazyCoder.chat_app_backend.model.Room;
import com.lazyCoder.chat_app_backend.repo.RoomRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class RoomService {

    private final RoomRepo roomRepo;

    public RoomService(RoomRepo roomRepo) {
        this.roomRepo = roomRepo;
    }

    // Create room Service
    public Room createRoom (RoomRequestDTO roomRequestDTO) {

        if(roomRepo.existsByRoomId(roomRequestDTO.getRoomId())) {
            log.info("Room with ID {} already exists.", roomRequestDTO.getRoomId());
            throw  new RoomAlreadyExistException("Room with ID " + roomRequestDTO.getRoomId() + " already exists.");
        }

        Room room = new Room();
        room.setRoomId(roomRequestDTO.getRoomId());
        roomRepo.save(room);
        return room;
    }

    // Get room
    public Room findRoom(String roomId) {

        Room room = roomRepo.findByRoomId(roomId);

        if(room == null){
            throw new RoomNotFoundException("Room with ID " + roomId + " does not exist.");
        }

        return room;
    }


    // Add message to room Service
    public List<Message>  findMessages(String roomId, int page, int pageSize){
        Room room = roomRepo.findByRoomId(roomId);

        if(room == null){
            throw new RoomNotFoundException("Room with ID " + roomId + " does not exist.");
        }
        List<Message> messages = room.getMessages();

        // Paginate messages so the newest messages are returned first.
        // The messages list is assumed to be ordered from oldest -> newest.
        // We compute a window [start, end) that selects pageSize messages
        // counting backwards from the end (newest). Page 0 returns the
        // most recent pageSize messages, page 1 the previous pageSize, etc.
        // Use Math.max/Math.min to clamp bounds and avoid IndexOutOfBounds.
        int start = Math.max(0, messages.size() - (page + 1) * pageSize);
        int end = Math.min(messages.size(), start + pageSize);

        return messages.subList(start, end);
    }

}
