package com.lazyCoder.chat_app_backend.repo;

import com.lazyCoder.chat_app_backend.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepo extends MongoRepository<Room, String> {

    Room findByRoomId(String roomId);
    boolean existsByRoomId(String roomId);
}
