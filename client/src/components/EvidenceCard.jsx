import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ThumbsDown, ThumbsUp } from 'lucide-react';
import { api } from '../api/client.js';
import { Badge } from './ui/badge.jsx';
import { Button } from './ui/button.jsx';
import { Card, CardContent } from './ui/card.jsx';

export function EvidenceCard({ evidence, onChanged }) {
  async function vote(value) {
    await api.vote(evidence.id, { value });
    onChanged?.();
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link to={`/profile/${evidence.author.id}`} className="text-xs font-black uppercase text-slate-500">
              {evidence.author.name}
            </Link>
            <h3 className="mt-1 text-lg font-black">{evidence.title}</h3>
            {evidence.community && <Badge variant="blue">{evidence.community.name}</Badge>}
          </div>
          <div className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-3 py-2 font-black text-emerald-700 dark:bg-emerald-950">
            <Award size={16} />
            {evidence.weightedScore}
          </div>
        </div>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{evidence.body}</p>
        <div className="flex flex-wrap gap-2">
          {evidence.suggestions.map((skill) => (
            <Badge key={skill.id} variant={skill.level === 'avanzado' ? 'gold' : 'default'}>
              {skill.name} · {skill.level}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => vote(1)}>
            <ThumbsUp size={16} />
            {evidence.voteSummary.positive}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => vote(-1)}>
            <ThumbsDown size={16} />
            {evidence.voteSummary.negative}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
