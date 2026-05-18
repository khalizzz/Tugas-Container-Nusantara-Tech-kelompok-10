# Nusantara Tech - Development Environment in a Box

Proyek ini adalah implementasi *containerization* menggunakan Docker dan Docker Compose untuk layanan Sistem Informasi Akademik (Web Node.js, PostgreSQL, dan MinIO Object Storage).

# 1. Cara Build dan Menjalankan Environment
Pastikan Docker dan Docker Compose sudah terinstal. Jalankan perintah berikut di dalam direktori proyek ini:

sudo docker compose up -d --build

Perintah ini akan menjalankan 4 *container* (`app`, `db`, `minio`, `nginx`) secara *background* dalam satu *custom bridge network* bernama `nusantara-network`.

## 2. Cara Mengakses Aplikasi Web
Aplikasi web CRUD dapat diakses melalui *Reverse Proxy* Nginx pada alamat:
**URL:** `http://192.168.1.18:8080`

# 3. Cara Mengakses Dashboard MinIO
Layanan S3-compatible Object Storage (MinIO) dapat diakses pada alamat:
**URL Dashboard:** `http://192.168.1.18:9011`
**Port API:** `9010`
**Letak Bucket:** `akademik-files`
