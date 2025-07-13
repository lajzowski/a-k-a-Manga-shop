import React from 'react';
import { Box, Typography, ButtonGroup, Button, CircularProgress, Paper, Grid, Avatar, Chip, Divider, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PaidIcon from '@mui/icons-material/Paid';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import EventIcon from '@mui/icons-material/Event';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

// Хук для получения отчёта автора
function useAuthorReportData(period?: { dateFrom?: Date, dateTo?: Date }) {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setError('Нет данных пользователя');
      setLoading(false);
      return;
    }
    let user: any = null;
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      setError('Ошибка чтения user');
      setLoading(false);
      return;
    }
    if (!user.contract_id) {
      setError('Нет contract_id');
      setLoading(false);
      return;
    }
    let url = '/report/author';
    const params = new URLSearchParams();
    if (period?.dateFrom) params.append('dateFrom', period.dateFrom.toISOString());
    if (period?.dateTo) params.append('dateTo', period.dateTo.toISOString());
    if (params.toString()) url += `?${params.toString()}`;
    setLoading(true);
    console.log('Запрос отчёта автора:', url, user);
    fetch(url, {
      headers: {
        'x-role': user.role,
        'x-contract-id': user.contract_id,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки');
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [period?.dateFrom?.toISOString(), period?.dateTo?.toISOString()]);

  return { data, loading, error };
}

const periodOptions = [
  { label: 'День', value: 'day' },
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' },
  { label: '2 Месяца', value: '2months' },
  { label: 'Весь период', value: 'all' },
];

function getPeriodRange(option: string): { dateFrom?: Date, dateTo?: Date } {
  const now = new Date();
  switch (option) {
    case 'day':
      return { dateFrom: new Date(now.getFullYear(), now.getMonth(), now.getDate()), dateTo: now };
    case 'week':
      return { dateFrom: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6), dateTo: now };
    case 'month':
      return { dateFrom: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29), dateTo: now };
    case '2months':
      return { dateFrom: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 59), dateTo: now };
    default:
      return {};
  }
}

const AuthorReportPage: React.FC = () => {
  const [period, setPeriod] = React.useState<string>('all');
  const periodRange = React.useMemo(() => getPeriodRange(period), [period]);
  const { data, loading, error } = useAuthorReportData(periodRange);

  React.useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('AuthorReportPage user:', user);
      } catch {}
    }
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Отчёт</Typography>
      <ButtonGroup sx={{ mb: 2 }}>
        {periodOptions.map(opt => (
          <Button
            key={opt.value}
            variant={period === opt.value ? 'contained' : 'outlined'}
            onClick={() => setPeriod(opt.value)}
            sx={{
              color: period === opt.value ? '#1976d2' : '#323127',
              fontWeight: 700,
              borderColor: period === opt.value ? '#1976d2' : '#99CCDA',
              backgroundColor: period === opt.value ? '#e3f2fd' : 'transparent',
              '&:hover': {
                backgroundColor: period === opt.value ? '#bbdefb' : '#f5f7fa',
                borderColor: '#1976d2',
              },
            }}
          >
            {opt.label}
          </Button>
        ))}
      </ButtonGroup>
      {loading ? (
        <Box display="flex" justifyContent="center" my={2}><CircularProgress size={24} /></Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box>
          {data.length === 0 ? (
            <Typography>Нет данных за выбранный период</Typography>
          ) : (
            data.map((group: any) => {
              const rentNum = group.rent && !isNaN(Number(group.rent)) ? Number(group.rent) : null;
              const profit = group.authorAmount;
              const isOk = rentNum !== null && profit > rentNum;
              // Исправленный парсинг даты заселения:
              let settlementDate: Date | null = null;
              if (group.settlementDate) {
                const parts = group.settlementDate.split('.');
                if (parts.length === 2) {
                  const day = Number(parts[0]);
                  const month = Number(parts[1]);
                  const year = new Date().getFullYear();
                  settlementDate = new Date(year, month - 1, day);
                } else {
                  settlementDate = new Date(group.settlementDate);
                }
              } else {
                settlementDate = null;
              }
              const now = new Date();
              const daysSinceSettlement = settlementDate ? (now.getTime() - settlementDate.getTime()) / (1000 * 60 * 60 * 24) : null;
              const isHalfOkGreen = period === 'all' && rentNum !== null && profit > rentNum / 2 && profit <= rentNum && daysSinceSettlement !== null && daysSinceSettlement < 31;
              return (
                <Paper key={group.groupNumber} sx={{ mb: 4, p: 3, bgcolor: '#f8fafc', borderRadius: 3, boxShadow: 3, maxWidth: 900, width: '100%', ml: 0 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Договор №{group.groupNumber}</Typography>
                  <Grid container spacing={2} sx={{ mb: 1, maxWidth: 900, justifyContent: 'flex-start' }}>
                    <Grid size={{ xs: 12, sm: 6, md: 'auto' }} sx={{ display: 'flex', alignItems: 'center' }}>
                      <MonetizationOnIcon sx={{ color: '#1976d2', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>Сумма продаж:</Typography>
                      <Typography variant="h6" sx={{ mr: 2 }}>{group.totalSales}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 'auto' }} sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccountBalanceIcon sx={{ color: '#2196f3', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>Комиссия:</Typography>
                      <Typography variant="h6" sx={{ mr: 2 }}>{group.commission}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 'auto' }} sx={{ display: 'flex', alignItems: 'center' }}>
                      <PaidIcon sx={{ color: (rentNum !== null && (profit > rentNum || isHalfOkGreen)) ? 'success.main' : (rentNum !== null && profit > rentNum / 2 ? 'warning.main' : 'error.main'), mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>Автору:</Typography>
                      <Typography variant="h6" sx={{ color: (rentNum !== null && (profit > rentNum || isHalfOkGreen)) ? 'success.main' : (rentNum !== null && profit > rentNum / 2 ? 'warning.main' : 'error.main'), mr: 2 }}>{group.authorAmount}</Typography>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ mb: 2, maxWidth: 900, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Grid size={{ xs: 12, sm: 6, md: 'auto' }} sx={{ display: 'flex', alignItems: 'center' }}>
                      <HomeWorkIcon sx={{ color: '#607d8b', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>Аренда:</Typography>
                      <Typography variant="h6" sx={{ mr: 1 }}>{group.rent ?? '-'}</Typography>
                      {period === 'all' && rentNum !== null && (
                        profit > rentNum ? (
                          <Chip
                            label="Окупил аренду"
                            color="success"
                            size="small"
                            sx={{ fontWeight: 600, ml: 0.5 }}
                          />
                        ) : profit > rentNum / 2 ? (
                          <Chip
                            label="Окупил половину аренды"
                            color={isHalfOkGreen ? 'success' : 'warning'}
                            size="small"
                            sx={{ fontWeight: 600, ml: 0.5 }}
                          />
                        ) : (
                          <Chip
                            label="Не окупил аренду"
                            color="error"
                            size="small"
                            sx={{ fontWeight: 600, ml: 0.5 }}
                          />
                        )
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 'auto' }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                      <EventIcon sx={{ color: '#8bc34a', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>Дата заселения:</Typography>
                      <Typography variant="h6">{group.settlementDate ?? '-'}</Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>Товары</Typography>
                  <TableContainer component={Paper} sx={{ mb: 2, boxShadow: 0 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f3f6fa', height: 44 }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>Наименование</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: 15 }}>Цена</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: 15 }}>Кол-во</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: 15 }}>Сумма</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: 15 }}>Комиссия с суммы</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: 15 }}>К выплате автору</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {group.listSells.map((item: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">{item.sale_price}</TableCell>
                            <TableCell align="right">{item.amount}</TableCell>
                            <TableCell align="right">{item.total}</TableCell>
                            <TableCell align="right">{item.commission}</TableCell>
                            <TableCell align="right">{item.authorAmount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              );
            })
          )}
        </Box>
      )}
    </Box>
  );
};

export default AuthorReportPage; 