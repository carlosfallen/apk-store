import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5176;

// Middleware para logs
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API routes FIRST - before static files
app.get('/api/apks', (req, res) => {
  console.log('API /api/apks called');
  const apksDir = path.join(__dirname, 'public', 'apks');
  
  try {
    // Ensure directory exists
    if (!fs.existsSync(apksDir)) {
      console.log('Creating apks directory:', apksDir);
      fs.mkdirSync(apksDir, { recursive: true });
      return res.json([]);
    }

    const files = fs.readdirSync(apksDir);
    console.log('Files in apks directory:', files);
    
    const apkFiles = files.filter(file => file.endsWith('.apk'));
    console.log('APK files found:', apkFiles);
    
    const apps = apkFiles.map((file, index) => {
      const filePath = path.join(apksDir, file);
      const stats = fs.statSync(filePath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      return {
        id: index + 1,
        name: file.replace('.apk', '').replace(/[_-]/g, ' '),
        filename: file,
        size: `${sizeInMB} MB`,
        downloadUrl: `/apks/${file}`
      };
    });

    console.log('Returning apps:', apps);
    res.json(apps);
  } catch (error) {
    console.error('Error in /api/apks:', error);
    res.status(500).json({ error: 'Erro ao listar APKs', details: error.message });
  }
});

// Serve APK files
app.use('/apks', express.static(path.join(__dirname, 'public', 'apks')));

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all handler: send back React's index.html file for SPA routing
app.get('*', (req, res) => {
  console.log('Serving index.html for:', req.path);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📁 APKs directory: ${path.join(__dirname, 'public', 'apks')}`);
});