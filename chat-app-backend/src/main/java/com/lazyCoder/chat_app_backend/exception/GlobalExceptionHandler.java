package com.lazyCoder.chat_app_backend.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RoomAlreadyExistException.class)
    public ResponseEntity<Map<String, String>> handleRoomAlreadyExistException(RoomAlreadyExistException e) {
        log.error("Room Already Exist : {}", e.getMessage());

        Map<String, String> response = Map.of(
                "error", "Room Already Exists",
                "message", e.getMessage()
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(RoomNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleRoomNotFoundException(RoomNotFoundException e) {
        log.error("Room Not Found : {}", e.getMessage());

        Map<String, String> response = Map.of(
                "error", "Room Not Found",
                "message", e.getMessage()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }



    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResourceNotFoundException(ResourceNotFoundException e) {
        log.error("Resource Not Found : {}", e.getMessage());
        Map<String, String> response = Map.of(
                "error", "Resource Not Found",
                "message", e.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentialsException(Exception e) {
        log.error("Bad Credentials : {}", e.getMessage());
        Map<String, String> response = Map.of(
                "error", "Unauthorized",
                "message", e.getMessage()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(Exception e) {
        log.error("Access Denied : {}", e.getMessage());
        Map<String, String> response = Map.of(
                "error", "Forbidden",
                "message", e.getMessage()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException e) {
        log.error("Bad Request : {}", e.getMessage());
        Map<String, String> response = Map.of(
                "error", "Bad Request",
                "message", e.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

}

