package com.lazyCoder.chat_app_backend.exception;

public class RoomAlreadyExistException extends RuntimeException {
    public RoomAlreadyExistException(String message) {
        super(message);
    }
}
