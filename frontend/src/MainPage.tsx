import React from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert,
  Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemText, Chip, Divider, Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useAuthorsReportData from './useAuthorsReportData';

const RiskAuthorsWidget: React.FC = () => {
  const { data, loading, error } = useAuthorsReportData();

  // Фильтруем авторов, которые не окупили аренду пропорционально прошедшим неделям (8 недель = 2 месяца)
  const riskAuthors = React.useMemo(() => {
    const now = new Date();
    return data
      .filter(group => group.rent && !isNaN(Number(group.rent)) && group.settlementDate)
      .map(group => {
        // Парсим дату заселения
        let settlementDate: Date | null = null;
        if (!group.settlementDate) return null;
        const parts = group.settlementDate.split('.');
        if (parts.length === 2) {
          const day = Number(parts[0]);
          const month = Number(parts[1]);
          const year = now.getFullYear();
          settlementDate = new Date(year, month - 1, day);
        } else if (parts.length === 3) {
          const day = Number(parts[0]);
          const month = Number(parts[1]);
          const year = Number(parts[2]);
          settlementDate = new Date(year, month - 1, day);
        }
        if (!settlementDate) return null;
        const rent = Number(group.rent);
        const authorAmount = Number(group.authorAmount);
        const daysOnShelf = (now.getTime() - settlementDate.getTime()) / (1000 * 60 * 60 * 24);
        const weeksOnShelf = Math.floor(daysOnShelf / 7);
        const mustEarn = Math.min(weeksOnShelf, 8) * (rent / 8);
        const deficit = mustEarn - authorAmount;
        return {
          ...group,
          settlementDateObj: settlementDate,
          daysOnShelf: Math.floor(daysOnShelf),
          weeksOnShelf,
          mustEarn,
          deficit,
          rent,
          authorAmount,
        };
      })
      .filter((group): group is NonNullable<typeof group> => !!group && group.weeksOnShelf > 0 && group.authorAmount < group.mustEarn);
  }, [data]);

  // Сумма к возврату (max): по всем авторам, которые не окупили аренду
  const totalToReturnMax = React.useMemo(() => {
    return data.reduce((sum, group) => {
      const rent = Number(group.rent);
      const authorAmount = Number(group.authorAmount);
      if (!isNaN(rent) && !isNaN(authorAmount) && authorAmount < rent) {
        return sum + (rent - authorAmount);
      }
      return sum;
    }, 0);
  }, [data]);

  // Сумма, которую нужно вернуть (аренда - сколько окупили)
  const totalToReturn = React.useMemo(() => {
    return riskAuthors.reduce((sum, group) => {
      const rent = Number(group.rent);
      const authorAmount = Number(group.authorAmount);
      if (isNaN(rent) || isNaN(authorAmount)) return sum;
      return sum + (rent - authorAmount);
    }, 0);
  }, [riskAuthors]);

  if (loading) return <Box my={2}><CircularProgress size={24} /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (riskAuthors.length === 0) return <Typography>Нет авторов в группе риска 🎉</Typography>;

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Если продажи у этих авторов прекратятся, столько придётся вернуть. Считается для всех, кто не окупил аренду полностью.">
          <span>Потенциальный риск возврата</span>
        </Tooltip>
        <b>{!isNaN(totalToReturnMax) ? totalToReturnMax.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) : '-'}</b>
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Те, кто уже сейчас не успевают окупить аренду по графику (пропорционально прошедшим неделям). Это реальный текущий риск.">
          <span>Текущий риск возврата</span>
        </Tooltip>
        <b>{!isNaN(totalToReturn) ? totalToReturn.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) : '-'}</b>
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Accordion sx={{ borderRadius: 2, boxShadow: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Группы в группе риска ({riskAuthors.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <List dense>
            {riskAuthors.map(group => {
              const toReturn = group.rent - group.authorAmount;
              const settlementDateStr = group.settlementDateObj ? group.settlementDateObj.toLocaleDateString('ru-RU') : group.settlementDate;
              return (
                <ListItem key={group.groupNumber} sx={{ py: 0.5, px: 1, minHeight: 36 }} disableGutters>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 70 }}>Группа {group.groupNumber}</Typography>
                    <Chip label="В группе риска" color="error" size="small" sx={{ fontWeight: 600, height: 22 }} />
                    <Typography variant="body2" sx={{ ml: 1, minWidth: 90 }}>
                      Нед.: <b>{group.weeksOnShelf}</b>
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 1, minWidth: 120 }}>
                      Должен был: <b>{group.mustEarn.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</b>
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 1, minWidth: 120 }}>
                      Окупил: <b>{group.authorAmount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</b>
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 1, minWidth: 120, color: '#d32f2f' }}>
                      Не хватает: <b>{group.deficit.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</b>
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110, textAlign: 'right' }}>
                      {settlementDateStr ? `Заселение: ${settlementDateStr}` : ''}
                    </Typography>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

const MainPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Главная страница</Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6">Авторы в группе риска</Typography>
        <RiskAuthorsWidget />
      </Paper>
    </Box>
  );
};

export default MainPage; 