package com.lazyCoder.chat_app_backend.controller;

import com.lazyCoder.chat_app_backend.dto.RoomRequestDTO;
import com.lazyCoder.chat_app_backend.model.Message;
import com.lazyCoder.chat_app_backend.model.Room;
import com.lazyCoder.chat_app_backend.service.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/rooms")
@CrossOrigin("*")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody RoomRequestDTO roomRequestDTO) {
        Room room = roomService.createRoom(roomRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }

    @GetMapping
    public ResponseEntity<Room> getRoom(@RequestParam String roomId) {
        Room room = roomService.findRoom(roomId);
        return ResponseEntity.ok(room);
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(
               @PathVariable String roomId,
               @RequestParam(defaultValue = "0", required = false) int page,
               @RequestParam(defaultValue = "20", required = false) int pageSize) {

        List<Message> messages = roomService.findMessages(roomId, page, pageSize);
        return ResponseEntity.ok(messages);

    }
}
