const express = require('express');
const { Pool } = require('pg');
const Minio = require('minio');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// PostgreSQL Connection [cite: 221, 222]
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

// MinIO Connection [cite: 229, 230]
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
});

const bucketName = process.env.MINIO_BUCKET_NAME || 'akademik-files';

// Auto-inisialisasi Tabel DB & Bucket MinIO saat Startup [cite: 274]
async function initServices() {
  try {
    // Buat tabel mahasiswa jika belum ada
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mahasiswa (
        id SERIAL PRIMARY KEY,
        nim VARCHAR(20) UNIQUE NOT NULL,
        nama VARCHAR(100) NOT NULL,
        dokumen_url VARCHAR(255)
      );
    `);
    console.log('✓ Database table initialized.');

    // Buat bucket MinIO jika belum ada [cite: 274]
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✓ Bucket "${bucketName}" created successfully.`);
    } else {
      console.log(`✓ Bucket "${bucketName}" already exists.`);
    }
  } catch (err) {
    console.error('Initialization error:', err.message);
  }
}
initServices();

// Tampilkan halaman utama dan daftar mahasiswa [cite: 250]
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mahasiswa ORDER BY id DESC');
    res.render('index', { mahasiswa: result.rows, bucketName });
  } catch (err) {
    res.status(500).send('Database Error: ' + err.message);
  }
});

// Tambah mahasiswa & upload dokumen ke MinIO 
app.post('/mahasiswa', upload.single('dokumen'), async (req, res) => {
  const { nim, nama } = req.body;
  let dokumenUrl = null;

  try {
    if (req.file) {
      const objectName = `${Date.now()}-${req.file.originalname}`;
      // Upload file ke MinIO bucket [cite: 17, 89]
      await minioClient.putObject(bucketName, objectName, req.file.buffer, req.file.size);
      dokumenUrl = objectName;
    }

    // Simpan ke PostgreSQL [cite: 15]
    await pool.query(
      'INSERT INTO mahasiswa (nim, nama, dokumen_url) VALUES ($1, $2, $3)',
      [nim, nama, dokumenUrl]
    );

    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error saving data: ' + err.message);
  }
});

// Endpoint untuk download/baca file langsung dari MinIO 
app.get('/download/:filename', async (req, res) => {
  try {
    const stream = await minioClient.getObject(bucketName, req.params.filename);
    stream.pipe(res);
  } catch (err) {
    res.status(404).send('File Not Found');
  }
});

const port = process.env.APP_PORT || 3000;
app.listen(port, () => {
  console.log(`Application running on port ${port}`);
});
