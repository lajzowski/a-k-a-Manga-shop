import React, { useEffect, useState } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Alert, Autocomplete, CircularProgress } from '@mui/material';

interface Author {
  id: number;
  username: string;
  contract_id: string;
  role: string;
}

const AuthorsAdminPage: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ username: '', password: '', contract_id: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [contracts, setContracts] = useState<string[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);

  const fetchAuthors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/authors');
      if (!res.ok) throw new Error('Ошибка загрузки авторов');
      const data = await res.json();
      setAuthors(data);
    } catch (e: any) {
      setError(e.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const fetchContracts = async () => {
    setContractsLoading(true);
    try {
      const res = await fetch('/authors/contracts');
      if (!res.ok) throw new Error('Ошибка загрузки номеров договоров');
      const data = await res.json();
      setContracts(data);
    } catch {
      setContracts([]);
    } finally {
      setContractsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
    fetchContracts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleContractChange = async (_: any, value: string | null) => {
    setForm((prev) => ({ ...prev, contract_id: value || '' }));
    // Если username пустой, пробуем автозаполнить
    if (value && !form.username) {
      try {
        const res = await fetch(`/authors/contract/${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.nick) {
            setForm((prev) => ({ ...prev, username: data.nick }));
          }
        }
      } catch {}
    }
  };

  const handleAddAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setAdding(true);
    try {
      const res = await fetch('/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Ошибка добавления автора');
      }
      setFormSuccess('Автор успешно добавлен');
      setForm({ username: '', password: '', contract_id: '' });
      fetchAuthors();
      fetchContracts();
    } catch (e: any) {
      setFormError(e.message || 'Ошибка');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Управление авторами</Typography>
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>Добавить автора</Typography>
        <form onSubmit={handleAddAuthor} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Логин"
            name="username"
            value={form.username}
            onChange={handleInputChange}
            required
            size="small"
          />
          <TextField
            label="Пароль"
            name="password"
            type="password"
            value={form.password}
            onChange={handleInputChange}
            required
            size="small"
          />
          <Autocomplete
            options={contracts}
            loading={contractsLoading}
            value={form.contract_id}
            onChange={handleContractChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Номер договора"
                name="contract_id"
                required
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {contractsLoading ? <CircularProgress color="inherit" size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{ minWidth: 200 }}
            disableClearable
            freeSolo={false}
          />
          <Button type="submit" variant="contained" disabled={adding}>Добавить</Button>
        </form>
        {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        {formSuccess && <Alert severity="success" sx={{ mt: 2 }}>{formSuccess}</Alert>}
      </Box>
      <Typography variant="h6" gutterBottom>Список авторов</Typography>
      {loading ? (
        <Typography>Загрузка...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Логин</TableCell>
                <TableCell>Номер договора</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {authors.map(author => (
                <TableRow key={author.id}>
                  <TableCell>{author.id}</TableCell>
                  <TableCell>{author.username}</TableCell>
                  <TableCell>{author.contract_id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AuthorsAdminPage; 