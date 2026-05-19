# Laporan Progres Pengerjaan Casebase - Nusantara Tech

Berikut adalah laporan progres dari kelompok kami terkait implementasi arsitektur containerization untuk layanan Sistem Informasi Akademik:

## A. Pemilihan Tech-Stack

**1. Bahasa pemrograman/framework dan Base Image**
Kami memilih menggunakan **Node.js** untuk membangun aplikasi CRUD. *Base image* yang kami gunakan di dalam `Dockerfile` adalah `node:alpine` (versi ringan dari Node.js berbasis Alpine Linux) untuk meminimalkan ukuran *image* akhir dan mempercepat proses *build*.

**2. Pemilihan Database**
Database yang kami gunakan adalah **PostgreSQL**. Kami memilih PostgreSQL karena keandalannya dalam menangani data relasional yang kompleks dan memiliki integritas data (*ACID compliance*) yang sangat baik, yang mana sangat krusial untuk data Sistem Informasi Akademik. Kami menggunakan versi `alpine` yang ringan dan stabil untuk lingkungan *container*.

**3. Konfirmasi Penggunaan MinIO**
Ya, kami sudah berhasil mengimplementasikan dan menggunakan **MinIO** sebagai *Object Storage*. Nama *bucket* yang rencananya akan kami gunakan untuk menyimpan dokumen/foto mahasiswa adalah `akademik-files`.

## B. Desain Arsitektur Jaringan

**1. Nama Docker Network**
Nama *docker network* (dengan *driver bridge*) yang kami definisikan secara kustom di dalam file `docker-compose.yml` adalah `nusantara-network`.

**2. Cara Aplikasi Web Memanggil Database dan MinIO**
Aplikasi web kami memanggil Database dan MinIO **bukan** menggunakan alamat IP statis, melainkan memanfaatkan fitur *Service Discovery* (resolusi DNS internal) bawaan Docker. 
Aplikasi web memanggil database cukup dengan menggunakan *Service Name* `db` sebagai *host*, dan memanggil object storage menggunakan *Service Name* `minio`. Selama semua kontainer berada di dalam `nusantara-network` yang sama, Docker akan otomatis menerjemahkan nama layanan tersebut ke IP internal kontainer masing-masing.

**3. Nomor Port Host yang Dibuka**
Untuk mengakses layanan dari mesin *host* (luar jaringan kontainer), kami membuka port berikut:
* **Dashboard Utama Aplikasi:** Port `8080` (Trafik masuk melalui Nginx *Reverse Proxy*).
* **Dashboard GUI Database:** Tidak ada GUI khusus (pengelolaan murni melalui backend/CLI kontainer).
* **Console MinIO:** Port `9011` (Sedangkan port API menggunakan `9010`).


## C. Kendala Teknis

**1. Kendala Terbesar di Minggu Pertama**
Kendala terbesar yang kami hadapi adalah mengatur konfigurasi *environment variables* agar aplikasi Node.js dapat berkomunikasi dengan PostgreSQL dan MinIO menggunakan *Service Name* yang tepat, serta mengatasi masalah hak akses (*permissions*) ketika mencoba menautkan *volume* data agar persisten.

**2. Layanan yang Sering Exit/Error**
Pada awalnya, layanan aplikasi web (`app` Node.js) sering mengalami *exit* atau *crash* saat dijalankan dengan `docker-compose up`. Hal ini terjadi karena *container* Node.js sudah menyala dan mencoba mengirim *query* koneksi sebelum *container* PostgreSQL benar-benar selesai melakukan proses inisialisasi (*booting* dan siap menerima koneksi).
