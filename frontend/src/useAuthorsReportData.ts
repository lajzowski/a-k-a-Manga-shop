import { useEffect, useState } from 'react';
import type { AuthorReport } from './AuthorsReport';

export default function useAuthorsReportData(period?: { dateFrom?: Date, dateTo?: Date }) {
  const [data, setData] = useState<AuthorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avgAuthorAmount, setAvgAuthorAmount] = useState(0);

  useEffect(() => {
    let url = '/report/authors';
    if (period && (period.dateFrom || period.dateTo)) {
      const params = new URLSearchParams();
      if (period.dateFrom) params.append('dateFrom', period.dateFrom.toISOString());
      if (period.dateTo) params.append('dateTo', period.dateTo.toISOString());
      url += `?${params.toString()}`;
    }
    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Ошибка загрузки');
        return res.json();
      })
      .then((authors: AuthorReport[]) => {
        setData(authors);
        const filtered = authors.filter(group => group.groupNumber !== 'unknown');
        const avg = filtered.length > 0 ? filtered.reduce((sum, group) => sum + group.authorAmount, 0) / filtered.length : 0;
        setAvgAuthorAmount(avg);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [period?.dateFrom?.toISOString(), period?.dateTo?.toISOString()]);

  return { data, loading, error, avgAuthorAmount };
} 