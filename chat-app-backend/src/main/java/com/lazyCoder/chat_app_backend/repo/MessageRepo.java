package com.lazyCoder.chat_app_backend.repo;

import com.lazyCoder.chat_app_backend.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepo extends MongoRepository<Message,String> {

    Page<Message> findByRoomIdOrderByTimeStampDesc(String roomId, Pageable pageable);

    @Query(value = "{ 'roomId': ?0 }", delete = true)
    void deleteByRoomId(String roomId);
}
