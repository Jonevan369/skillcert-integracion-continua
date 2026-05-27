import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { api } from '../api/client.js';
import { EvidenceCard } from '../components/EvidenceCard.jsx';
import { EvidenceForm } from '../components/EvidenceForm.jsx';
import { SkillMap } from '../components/SkillMap.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { useAuth } from '../hooks/useAuth.js';

export function DashboardPage() {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [trends, setTrends] = useState([]);

  async function refresh() {
    const [nextFeed, nextTrends] = await Promise.all([api.feed(), api.trends()]);
    setFeed(nextFeed);
    setTrends(nextTrends);
  }

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-6">
        <EvidenceForm onCreated={refresh} />
        <SkillMap userId={user.id} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp size={20} /> Tendencias de la semana</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {trends.map((trend) => (
              <Badge variant="blue" key={trend.name}>{trend.name} · {trend.validationScore}</Badge>
            ))}
          </CardContent>
        </Card>
      </section>
      <section className="space-y-4">
        <h1 className="text-3xl font-black">Feed competencial</h1>
        {feed.map((evidence) => <EvidenceCard evidence={evidence} onChanged={refresh} key={evidence.id} />)}
      </section>
    </main>
  );
}
