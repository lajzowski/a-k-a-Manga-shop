import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';

export default function Login({ onLogin }: { onLogin: (user: { username: string; role: string }) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Неверный логин или пароль');
      const data = await res.json();
      localStorage.setItem('user', JSON.stringify(data));
      onLogin(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f7fa">
      <Paper elevation={3} sx={{ p: 4, minWidth: 340, borderRadius: 3 }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          Вход в систему
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Логин"
            variant="outlined"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            fullWidth
            autoComplete="username"
          />
          <TextField
            label="Пароль"
            variant="outlined"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 1, fontWeight: 600, boxShadow: 'none', textTransform: 'none' }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </Button>
          {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        </Box>
      </Paper>
    </Box>
  );
} 