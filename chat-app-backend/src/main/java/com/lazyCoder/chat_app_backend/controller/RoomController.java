package com.lazyCoder.chat_app_backend.controller;

import com.lazyCoder.chat_app_backend.dto.RoomRequestDTO;
import com.lazyCoder.chat_app_backend.model.Message;
import com.lazyCoder.chat_app_backend.model.Room;
import com.lazyCoder.chat_app_backend.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(@Valid @RequestBody RoomRequestDTO roomRequestDTO, Principal principal) {
        String username = principal != null ? principal.getName() : "Anonymous";
        Room room = roomService.createRoom(roomRequestDTO, username);
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

        Page<Message> roomMessages = roomService.getRoomMessages(roomId, page, pageSize);
        return ResponseEntity.ok(roomMessages.getContent());

    }

    @GetMapping("/my-rooms")
    public ResponseEntity<List<Room>> getMyRooms(Principal principal) {
        List<Room> myRooms = roomService.getRoomsByCreator(principal.getName());
        return ResponseEntity.ok(myRooms);
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String roomId, Principal principal) {
        String username = principal != null ? principal.getName() : "Anonymous";
        roomService.deleteRoom(roomId, username);
        return ResponseEntity.noContent().build();
    }
}

