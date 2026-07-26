package com.lazyCoder.chat_app_backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "messages")
@CompoundIndex(name = "room_time_idx", def = "{'roomId': 1, 'timeStamp': -1}")
public class Message {

    @Id
    private String id;

    private String roomId;

    private String sender;

    private String content;

    @Builder.Default
    private Instant timeStamp = Instant.now();

    public Message(String sender, String content) {
        this.sender = sender;
        this.content = content;
        this.timeStamp = Instant.now();
    }
}
