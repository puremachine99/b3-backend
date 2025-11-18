# B3Sahabat IoT Backend 🚀

Backend ini dibuat dengan NestJS + Prisma + MQTT. Tugasnya: ngobrol sama device IoT, simpan log, dan kirim update realtime ke frontend lewat WebSocket. garis besarnya "INI REMOTE !"

## Apa yang bisa dilakukan?
- **Device status realtime:** Terima pesan LWT dari MQTT, update status device (ONLINE/OFFLINE) di database, dan siarkan lewat socket (`device-connection`, `device-availability`, `device-status`).
- **Kirim perintah ke device:** Endpoint `POST /devices/:serialNumber/cmd`.
- **Pantau log/device:** Simpan log ke database dan broadcast ke frontend (`device-log`).
- **REST API untuk device:** CRUD, plus endpoint baru `GET /devices/:id/status` untuk cek status terakhir.

## Siapkan lingkungan (pit stop dulu)
1) Pastikan sudah install **Node.js 18+** dan **npm**.  
2) Clone repo dan install dependency:
   ```bash
   npm install
   ```
3) Siapkan environment:
   - Copy `.env.example` (jika ada) jadi `.env`.
   - Set `DATABASE_URL` (PostgreSQL) dan `MQTT_URL` (contoh: `mqtt://localhost:1883`).
4) Migrasi dan generate Prisma client:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

## Cara jalanin (gas tipis-tipis)
- **Dev mode watch**  
  ```bash
  npm run start:dev
  ```
- **Build**  
  ```bash
  npm run build
  ```
- **Prod** (setelah build)  
  ```bash
  npm run start:prod
  ```
- **Tes**  
  ```bash
  npm test
  ```

## Alur MQTT & WebSocket (biar kebayang)
1) **LWT dari device** (`device/{serial}/lwt`): payload `ONLINE`/`OFFLINE`.  
   - Update kolom `status` + `lastSeenAt` di tabel Device.  
   - Broadcast ke WebSocket:
     - `device-connection` (status string)
     - `device-availability` (boolean)
     - `device-status` ({ status })
     - `device-log` (ringkasan readable)
2) **Status update** (`device/{serial}/status`): payload JSON/text.  
   - Disiarkan ke WebSocket `device-status` + `device-log`, dicatat ke DB.

## Endpoint penting buat frontend
- `GET /devices/:id/status` – ambil status, serialNumber, lastSeenAt.  
- `GET /devices` / `GET /devices/:id` – data device.  
- `POST /devices/:serialNumber/cmd` – kirim perintah.

Semua endpoint yang butuh login pakai header `Authorization: Bearer <token>`.

## Postman collection
File `B3Sahabat-IoT.postman_collection.json` sudah ditambah request **Get Device Status** (`/devices/{{deviceId}}/status`). Import aja ke Postman/Insomnia.

## Tips cepat ala lapangan
- Kalau MQTT broker beda host/port, sesuaikan `MQTT_URL` di `.env`.
- Cek log di console untuk topik MQTT yang gagal subscribe.
- Test WebSocket dari browser/devtools: event `device-connection`, `device-availability`, `device-status`, `device-log` dikirim ke room deviceId.

Selamat ngebut! Kalau ada error, baca log dulu—ibarat dengar klakson di jalan, itu tanda ada yang perlu dibereskan. 👍
