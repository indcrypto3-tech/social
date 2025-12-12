# Project Flow Diagrams (ASCII)

## 1. High-Level Architecture Overview

```text
+-----------------+       +-------------------------------------------+
|   End User      |       |             Cloud Infrastructure          |
+-------+---------+       |                                           |
        |                 |   +-------------+       +-------------+   |
        | HTTPS/WSS       |   |  Next.js    |       |  Supabase   |   |
        v                 |   |  App Server |<----->|  Auth & DB  |   |
+-------+---------+       |   +------+------+       +-------------+   |
|   Web Browser   |       |          |                     ^          |
| (Client Side)   |<------+          | (Writes Jobs)       | (Reads)  |
+-----------------+       |          v                     |          |
                          |   +-------------+       +------+------+   |
                          |   |   Redis     |<------|  Worker     |   |
                          |   |   Queue     |       |  Service    |   |
                          |   +-------------+       +------+------+   |
                          |                                |          |
                          +--------------------------------+----------+
                                                           |
                                                           v
                                                +----------+----------+
                                                |  Social Platforms   |
                                                | (FB, LinkedIn, X)   |
                                                +---------------------+
```

## 2. Authentication & User Sync Flow

```text
User            Browser           Supabase Auth        Next.js App          Database
 |                 |                    |                   |                   |
 |--- Click Login->|                    |                   |                   |
 |                 |--- Authenticate -->|                   |                   |
 |                 |<--- Session Token--|                   |                   |
 |                 |                    |                   |                   |
 |                 |--- Redirect w/Token ------------------>|                   |
 |                 |                    |                   |                   |
 |                 |                    |           Validate Session            |
 |                 |                    |                   |                   |
 |                 |                    |                   |---- Check User -->|
 |                 |                    |                   |<--- Result -------|
 |                 |                    |                   |                   |
 |                 |                    |                   |--- If New, Sync ->|
 |                 |                    |                   |                   |
 |<-- Dashboard ---|                    |                   |<-- Redirect ------|
```

## 3. Post Scheduling Flow

```text
   [User Interface]                  [Backend Server]                [Database]          [Redis Queue]
          |                                 |                             |                    |
          | 1. Compose Post                 |                             |                    |
          | 2. Select Date/Time             |                             |                    |
          | 3. Click "Schedule"             |                             |                    |
          |-------------------------------->|                             |                    |
          |                                 |                             |                    |
          |                                 | 4. Validate Data            |                    |
          |                                 |                             |                    |
          |                                 | 5. Create Draft Record      |                    |
          |                                 |---------------------------->|                    |
          |                                 |                             |                    |
          |                                 | 6. Add Job "publish-post"   |                    |
          |                                 |    (with Delay)             |                    |
          |                                 |------------------------------------------------->|
          |                                 |                             |                    |
          | 7. Return Success               |                             |                    |
          |<--------------------------------|                             |                    |
          |                                 |                             |                    |
   [Show Confirmation]                      |                             |                    |
```

## 4. Worker Publishing Process

```text
                                              +----------------+
                                              |  Redis Queue   |
                                              +-------+--------+
                                                      |
                                           1. Job Ready (Delay over)
                                                      |
                                                      v
                                              +-------+--------+
    +-----------------+                       |     Worker     |
    |    Database     |<---- 2. Fetch Post ---|    Process     |
    +--------+--------+                       +-------+--------+
             ^                                        |
             |                                        | 3. Iterate Destinations
             |      4. Post to API                    |
      Update Status <--------+               +--------v---------+
             |               |               |  Social Network  |
             |               +-------------->|      API         |
             |                               +------------------+
             |
             |
    +--------+--------+
    |  Mark Job Done  |
    +-----------------+
```
