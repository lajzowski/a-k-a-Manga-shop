import React, { useMemo, useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Accordion, AccordionSummary, AccordionDetails,
  Typography, IconButton, Box, CircularProgress, Button, ButtonGroup
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import useAuthorsReportData from './useAuthorsReportData';

// Типы данных

export type Sell = {
  name: string;
  sale_price: number;
  amount: number;
  total: number;
  commission: number;
  authorAmount: number;
  rest: number;
};

export type AuthorReport = {
  groupNumber: string;
  totalSales: number;
  commission: number;
  authorAmount: number;
  listSells: Sell[];
  rent: string | null; // добавлено поле аренды
  settlementDate?: string | null; // дата заселения
};

// Функция для определения цвета прибыли
function getProfitColor(amount: number, avg: number) {
  if (amount >= avg + 1000) return 'success.main'; // больше среднего
  if (amount <= avg - 1000) return 'error.main'; // меньше среднего
  return 'warning.main'; // около среднего
}

type SortField = keyof AuthorReport;

const columns: { key: SortField, label: string, align?: 'right' | 'left' | 'center' }[] = [
  { key: 'groupNumber', label: 'Группа' },
  { key: 'totalSales', label: 'Сумма продаж', align: 'right' },
  { key: 'commission', label: 'Комиссия', align: 'right' },
  { key: 'authorAmount', label: 'Сумма автору', align: 'right' },
];

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

// Этот компонент — отчёт по всем авторам (для админа)
// ВНИМАНИЕ: Это компонент отчёта по всем авторам (админский), не путать с AuthorReportPage (отчёт автора)
const AuthorsReport: React.FC = () => {
  const [period, setPeriod] = useState<string>('all');
  const periodRange = useMemo(() => getPeriodRange(period), [period]);
  const { data, loading, error, avgAuthorAmount } = useAuthorsReportData(periodRange);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [sortField, setSortField] = useState<SortField>('authorAmount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // обработчик сортировки
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // сортировка данных
  const filteredData = data.filter(group => group.groupNumber !== 'unknown');
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (sortField === 'groupNumber') {
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      const aIsNum = !isNaN(aNum);
      const bIsNum = !isNaN(bNum);
      if (aIsNum && bIsNum) {
        return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
      }
      // если хотя бы одно не число — сортируем как строки
      return sortOrder === 'asc' ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    return 0;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Отчёт по авторам</Typography>
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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell
                  key={col.key}
                  align={col.align}
                  onClick={() => handleSort(col.key)}
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  {col.label}
                  {sortField === col.key && (
                    sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} /> : <ArrowDownwardIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
                  )}
                </TableCell>
              ))}
              <TableCell align="right">Аренда</TableCell>
              <TableCell align="right">Дата заселения</TableCell> {/* новая колонка */}
              <TableCell align="center">Товары</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((group) => (
              <React.Fragment key={group.groupNumber}>
                <TableRow hover>
                  <TableCell>
                    <Typography variant="subtitle1">{group.groupNumber}</Typography>
                  </TableCell>
                  <TableCell align="right">{group.totalSales}</TableCell>
                  <TableCell align="right">{group.commission}</TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        fontWeight: 600,
                        color:
                          group.rent && !isNaN(Number(group.rent))
                            ? (group.authorAmount > Number(group.rent)
                                ? 'success.main'
                                : group.authorAmount > Number(group.rent) / 2
                                  ? 'warning.main'
                                  : 'error.main')
                            : getProfitColor(group.authorAmount, avgAuthorAmount),
                        borderRadius: 1,
                        px: 1.5,
                        py: 0.5,
                        display: 'inline-block',
                        bgcolor:
                          group.rent && !isNaN(Number(group.rent))
                            ? (group.authorAmount > Number(group.rent)
                                ? 'success.main'
                                : group.authorAmount > Number(group.rent) / 2
                                  ? 'warning.main'
                                  : 'error.main') + '20'
                            : `${getProfitColor(group.authorAmount, avgAuthorAmount)}20`,
                      }}
                    >
                      {group.authorAmount}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{group.rent ?? '-'}</TableCell> {/* отображение аренды */}
                  <TableCell align="right">{group.settlementDate ?? '-'}</TableCell> {/* дата заселения */}
                  <TableCell align="center">
                    <IconButton
                      onClick={() => setExpanded(expanded === group.groupNumber ? false : group.groupNumber)}
                      aria-label="Показать товары"
                      size="small"
                    >
                      <ExpandMoreIcon
                        sx={{
                          transform: expanded === group.groupNumber ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                    <Accordion
                      expanded={expanded === group.groupNumber}
                      onChange={() => setExpanded(expanded === group.groupNumber ? false : group.groupNumber)}
                      elevation={0}
                      sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 'none',
                        borderTop: '1px solid #eee',
                        '&:before': { display: 'none' },
                        m: 0,
                      }}
                    >
                      <AccordionSummary
                        expandIcon={null}
                        aria-controls={`panel-${group.groupNumber}-content`}
                        id={`panel-${group.groupNumber}-header`}
                        sx={{ display: 'none' }}
                      />
                      <AccordionDetails sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Список проданных товаров</Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Название</TableCell>
                              <TableCell>Цена</TableCell>
                              <TableCell>Кол-во</TableCell>
                              <TableCell>Сумма</TableCell>
                              <TableCell>Комиссия</TableCell>
                              <TableCell>Автору</TableCell>
                              <TableCell>Остаток</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {group.listSells.map((sell, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{sell.name}</TableCell>
                                <TableCell>{sell.sale_price}</TableCell>
                                <TableCell>{sell.amount}</TableCell>
                                <TableCell>{sell.total}</TableCell>
                                <TableCell>{sell.commission}</TableCell>
                                <TableCell>{sell.authorAmount}</TableCell>
                                <TableCell>{sell.rest}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AuthorsReport; 