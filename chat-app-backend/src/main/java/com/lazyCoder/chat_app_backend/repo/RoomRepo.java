package com.lazyCoder.chat_app_backend.repo;

import com.lazyCoder.chat_app_backend.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepo extends MongoRepository<Room, String> {

    Optional<Room> findByRoomId(String roomId);

    boolean existsByRoomId(String roomId);

    void deleteByRoomId(String roomId);

    List<Room> findByCreatedBy(String createdBy);

}
