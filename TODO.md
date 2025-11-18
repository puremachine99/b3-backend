# B3SAHABAT-IOT

## CORE STRUCTURE
- [x] Setup Nest project base
- [x] Install dependencies: @nestjs/core, @nestjs/common, @nestjs/config, @nestjs/microservices, mqtt
- [x] Configure main.ts & app.module.ts
- [x] Integrate dotenv for environment setup
- [x] Setup Prisma ORM (PostgreSQL)
- [x] Define Prisma schema (User, Device, DeviceLog, Group, Membership, DeviceCommand)

## MODULES

### mqtt (internal)
- [x] Create mqtt.module.ts
- [x] Implement mqtt.service.ts (connect, publish, subscribe)
- [ ] Add logging & reconnect handler
- [x] Subscribe to topic: laundry/+/status
- [ ] Parse incoming status → save via DeviceLogsService
- [ ] Auto-create device entry if not exist (upsert)
- [x] Forward incoming messages to RealtimeGateway
- [ ] Add QoS configuration via ENV
- [ ] Add unit test (optional)

### devices (REST API)
- [x] Create devices.module.ts
- [x] Implement DevicesService (call MqttService)
- [x] Implement DevicesController (POST /:id/cmd)
- [x] Add SendCommandDto validation
- [ ] Integrate DeviceLogsService (save command log)
- [x] Add GET /devices (list all devices from DB)
- [x] Add GET /devices/:id (detail)
- [x] Add POST /devices (create)
- [x] Add PATCH /devices/:id (update metadata)
- [x] Add DELETE /devices/:id (remove)
- [x] Add event listener from MQTT (status update broadcast)
- [x] Add filtering & clustering endpoint (bulk command)
- [ ] Add command queue for massive publish (BullMQ)

### device-logs (REST API)
- [x] Create device-logs.module.ts
- [x] Implement DeviceLogsService (Prisma integration)
- [x] Connect with Prisma (insert log after every command)
- [x] Add endpoint: GET /device-logs/:deviceId
- [ ] Auto-create device if missing
- [ ] Add pagination and filtering
- [ ] Add cleanup/archiving task

### users (REST API)
- [x] Create users.module.ts
- [x] Implement UsersService (Prisma + bcrypt)
- [x] Implement UsersController (create + list)
- [x] Import Role enum from Prisma
- [x] Validate role input
- [x] Add PATCH /users/:id (update)
- [x] Add DELETE /users/:id (delete)
- [x] Restrict routes by role (admin only)
- [x] Relation to DeviceLog.userId

### auth (REST API)
- [x] Create auth.module.ts
- [x] Add JWT AuthService (login, verify)
- [x] Add AuthController (POST /auth/login)
- [x] Use secret from .env (JWT_SECRET)
- [x] Add register endpoint (admin create users)
- [x] Create AuthGuard (protect routes)
- [x] Middleware: verify JWT token & attach user context

### realtime (WebSocket)
- [x] Create realtime.module.ts
- [x] Implement RealtimeGateway (Socket.io)
- [x] Handle connect/disconnect logging
- [x] Push events from MQTT → WebSocket to clients
- [ ] Add heartbeat / health ping
- [ ] Add room-based subscription (per group or device)
- [ ] Integrate with Next.js client for live updates

### database (internal)
- [x] Create database.module.ts
- [x] Implement PrismaService (connect/disconnect)
- [x] Test DB connection with simple query
- [x] Generate Prisma client
- [ ] Global module registration for reuse
- [ ] Add health check (on startup)

### groups (REST API)
- [x] Define Group model in Prisma
- [x] Define DeviceGroupMembership model
- [x] Create groups.module.ts
- [x] Add CRUD endpoints (list, create, update, delete)
- [x] Add membership endpoints (add/remove device)
- [x] Add POST /commands/group/:id (bulk publish to group)
- [ ] Add aggregation query (count devices per group)

### commands (REST API)
- [x] Define DeviceCommand model (outbox)
- [x] Create commands.module.ts
- [x] Implement CommandService (record + publish)
- [ ] Add retry & status tracking
- [x] Add endpoint: POST /commands/group/:id
- [ ] Add endpoint: GET /commands?status=PENDING
- [ ] Add background worker for retries (BullMQ/Redis)

## INTEGRATION FLOW
- [x] DeviceController → call MqttService.publishCommand()
- [ ] MqttService → subscribeStatus() → save via DeviceLogsService
- [x] MqttService → emit event to RealtimeGateway
- [x] RealtimeGateway → broadcast to connected clients
- [x] DeviceLogsService → persist logs to Postgres via Prisma
- [ ] WebSocket client → receive live updates
- [ ] Command outbox → manage retries / ack

## NEXT STEPS
- [ ] Add Docker Compose (Postgres + Redis + MQTT Broker)
- [x] Setup environment (.env: DB_URL, MQTT_URL, JWT_SECRET)
- [x] Implement seed script for users & devices
- [ ] Integrate WebSocket client (frontend Next.js)
- [ ] Add CI/CD pipeline (build + migrate)
- [ ] Implement metrics endpoint (Prometheus / Grafana)
