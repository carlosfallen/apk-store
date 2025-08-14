import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

function App() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/apks');
      if (!response.ok) throw new Error('Erro ao carregar apps');
      const data = await response.json();
      setApps(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = useMemo(() => {
    if (!searchTerm) return apps;
    return apps.filter(app => 
      app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [apps, searchTerm]);

  const handleDownload = (app) => {
    // Feedback tátil no mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    const link = document.createElement('a');
    link.href = app.downloadUrl;
    link.download = app.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (sizeString) => {
    const size = parseFloat(sizeString);
    if (size >= 1000) {
      return `${(size / 1000).toFixed(1)} GB`;
    }
    return sizeString;
  };

  const getAppIcon = (appName) => {
    const name = appName.toLowerCase();
    if (name.includes('game') || name.includes('jogo')) return '🎮';
    if (name.includes('music') || name.includes('musica')) return '🎵';
    if (name.includes('video') || name.includes('player')) return '🎬';
    if (name.includes('photo') || name.includes('camera')) return '📷';
    if (name.includes('social') || name.includes('chat')) return '💬';
    if (name.includes('tool') || name.includes('util')) return '🔧';
    if (name.includes('browser') || name.includes('web')) return '🌐';
    if (name.includes('office') || name.includes('work')) return '📄';
    return '📱';
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Carregando apps...</h2>
          <p>Aguarde enquanto buscamos os aplicativos</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Ops! Algo deu errado</h2>
          <p>{error}</p>
          <button onClick={fetchApps} className="retry-btn">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">APK Store</h1>
          <p className="header-subtitle">Downloads seguros para sua comunidade</p>
          {apps.length > 0 && (
            <div className="stats-bar">
              <span>📦 {apps.length} apps</span>
              <span>•</span>
              <span>🔒 Seguro</span>
            </div>
          )}
        </div>
      </header>

      <main className="main">
        {apps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>Nenhum app disponível</h2>
            <p>Adicione arquivos APK na pasta do servidor para começar a usar a loja</p>
          </div>
        ) : (
          <>
            <div className="search-container">
              <div className="search-icon">🔍</div>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar aplicativos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredApps.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h2>Nenhum resultado encontrado</h2>
                <p>Tente buscar por outro termo</p>
              </div>
            ) : (
              <div className="apps-grid">
                {filteredApps.map((app) => (
                  <div 
                    key={app.id} 
                    className="app-card"
                    onClick={() => handleDownload(app)}
                  >
                    <div className="app-icon">
                      {getAppIcon(app.name)}
                    </div>
                    <div className="app-info">
                      <h3 className="app-name">{app.name}</h3>
                      <div className="app-details">
                        <div className="app-size">
                          <span>💾</span>
                          <span>{formatFileSize(app.size)}</span>
                        </div>
                      </div>
                    </div>
                    <button className="download-btn" aria-label="Download">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path 
                          d="M12 15L7 10H17L12 15Z" 
                          fill="currentColor"
                        />
                        <path 
                          d="M12 4V14M5 20H19" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <p>🏠 Umbrel Community • APK Store Mobile</p>
      </footer>
    </div>
  );
}

export default App;