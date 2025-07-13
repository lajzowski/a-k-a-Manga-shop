import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { AppBar, Toolbar, Typography, Button, Container, ThemeProvider, createTheme, Box, Paper, CircularProgress, TextField, ButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Divider, Avatar } from '@mui/material';
import Grid from '@mui/material/Grid';
import { AuthorReport } from './AuthorsReport';
import useAuthorsReportData from './useAuthorsReportData';
import Login from './Login';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PaidIcon from '@mui/icons-material/Paid';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import EventIcon from '@mui/icons-material/Event';
import AuthorReportPage from './AuthorReportPage';
import MainPage from './MainPage';

// Заменяю стандартную тему на кастомную с нужным цветом
const theme = createTheme({
  palette: {
    primary: {
      main: '#99CCDA',
      contrastText: '#323127', // изменён с #fff на #323127
    },
    secondary: {
      main: '#1976d2', // можно заменить на другой, если нужно
    },
  },
});

const AuthorsReport = React.lazy(() => import('./AuthorsReport'));
const AuthorsAdminPage = React.lazy(() => import('./AuthorsAdminPage'));

// Удаляю определение функции AuthorReportPage, чтобы не было конфликта с импортом

function AuthorSettingsPage() {
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [repeatPassword, setRepeatPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!oldPassword || !newPassword || !repeatPassword) {
      setError('Заполните все поля');
      return;
    }
    if (newPassword !== repeatPassword) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Ошибка смены пароля');
      }
      setSuccess('Пароль успешно изменён');
      setOldPassword('');
      setNewPassword('');
      setRepeatPassword('');
    } catch (e: any) {
      setError(e.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5" gutterBottom>Настройки автора</Typography>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextField
          label="Старый пароль"
          type="password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          required
        />
        <TextField
          label="Новый пароль"
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
        <TextField
          label="Повторите новый пароль"
          type="password"
          value={repeatPassword}
          onChange={e => setRepeatPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" disabled={loading}>Сменить пароль</Button>
        {error && <Typography color="error">{error}</Typography>}
        {success && <Typography color="primary">{success}</Typography>}
      </form>
    </Box>
  );
}

// Новый компонент меню
function MenuBar({ user, onLogout }: { user: { username: string; role: string }, onLogout: () => void }) {
  return (
    <AppBar position="static" sx={{ boxShadow: 'none' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AKA Shop
          </Typography>
          {user.role === 'admin' && (
            <>
              <Button color="inherit" component={Link} to="/">Главная</Button>
              <Button color="inherit" component={Link} to="/authors-report">Отчёт по авторам</Button>
              <Button color="inherit" component={Link} to="/authors-admin">Авторы</Button>
            </>
          )}
          {user.role === 'author' && (
            <>
              <Button color="inherit" component={Link} to="/author-report">Отчёт</Button>
              <Button color="inherit" component={Link} to="/author-settings">Настройки</Button>
            </>
          )}
          <Box sx={{ flexGrow: 0, ml: 2 }}>
            <Typography variant="body2" component="span" sx={{ mr: 1 }}>{user.username} ({user.role})</Typography>
            <Button color="inherit" onClick={onLogout}>Выйти</Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

function App() {
  const [user, setUser] = React.useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  React.useEffect(() => {
    console.log('App user:', user);
  }, [user]);

  const handleLogin = (user: { username: string; role: string }) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Глобальный fetch с x-role
  React.useEffect(() => {
    const origFetch = window.fetch;
    window.fetch = (input, init = {}) => {
      const u = localStorage.getItem('user');
      let headers = (init.headers as any) || {};
      if (u) {
        try {
          const parsed = JSON.parse(u);
          headers = { ...headers, 'x-role': parsed.role };
        } catch {}
      }
      return origFetch(input, { ...init, headers });
    };
    return () => { window.fetch = origFetch; };
  }, []);

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <MenuBar user={user} onLogout={handleLogout} />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Routes>
            {user.role === 'admin' && (
              <>
                <Route path="/" element={<MainPage />} />
                <Route path="/authors-report" element={<React.Suspense fallback={<div>Загрузка...</div>}><AuthorsReport /></React.Suspense>} />
                <Route path="/authors-admin" element={<React.Suspense fallback={<div>Загрузка...</div>}><AuthorsAdminPage /></React.Suspense>} />
              </>
            )}
            {user.role === 'author' && (
              <>
                <Route path="/author-report" element={<AuthorReportPage />} />
                <Route path="/author-settings" element={<AuthorSettingsPage />} />
                <Route path="/" element={<Box textAlign="center" mt={8}><Typography variant="h5">Пока нет доступных разделов</Typography></Box>} />
              </>
            )}
            {/* fallback route */}
            <Route path="*" element={<Box textAlign="center" mt={8}><Typography color="error" variant="h5">Страница не найдена</Typography></Box>} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
