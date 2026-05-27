import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

export function useSkills(userId, filters) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const data = await api.competenceMap(userId, filters);
    setSkills(data.competences);
    setLoading(false);
  }, [userId, filters?.level, filters?.name]);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  return { skills, loading, refresh };
}
