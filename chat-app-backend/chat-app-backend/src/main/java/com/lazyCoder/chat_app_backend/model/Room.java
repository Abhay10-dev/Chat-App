package com.lazyCoder.chat_app_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "rooms")
public class Room {

    @Id
    private String id;  // mongoDB Unique Identifier

    private String roomId;

    private List<Message> messages = new ArrayList<>();

}
