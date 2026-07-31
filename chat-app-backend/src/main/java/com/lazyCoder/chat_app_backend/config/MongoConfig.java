package com.lazyCoder.chat_app_backend.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.jspecify.annotations.NullMarked;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

@Configuration
@NullMarked
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Override
    protected String getDatabaseName() {
        return "chat-app";
    }

    @Bean
    @Override
    public MongoClient mongoClient() {
        return MongoClients.create(mongoUri);
    }

}