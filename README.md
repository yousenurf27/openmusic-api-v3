# Openmusic Api

This project uses Hapi Plugin, Redis, RabbitMQ and docker for support Redis and RabbitMQ.
The purpose of using the plugin itself is none other than to create separate or isolated business or utility logic so that when developing applications the focus can be mapped.

### Steps to run the project

1. **Install modules**

   `npm install`

2. **Downlaod PostgreSQL, if you don't have it**

3. **Create a user with the username `developer` and password `supersecretpassword`**

4. **Create a database with the name `openmusic` and then GRANT ALL and ALTER OWNER db openmusic to user `developer`**

5. **Run migration file for create all tables needed**

   `npm run migrate up`

6. **Download image RabbitMQ in docker**

   `docker pull rabbitmq:management`

7. **Create container and run RabbitMQ in background**

   `docker run --name rabbitmq -p 5672:5672 -p 15672:15672 -d rabbitmq:management`

8. **Access rebbitMQ [http://localhost:15672](http://localhost:15672) and then use username and password `guest`**

9. **Downdload image Redis for caching Restful Api**

   `docker pull redis`

10. **Create container and run redis in background**

    `docker run --name redis -p 6379:6379 -d redis`

11. **Last step, run the Restful Api**

### Testing Api

In this project I used Postman to test my Restful Api, you can download using the link below (from Dicoding):

[Downlaod](https://github.com/dicodingacademy/a271-backend-menengah-labs/raw/099-shared-files/03-submission-content/03-open-music-api-v3/OpenMusic%20API%20V3%20Test.zip)
