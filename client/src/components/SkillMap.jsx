import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useSkills } from '../hooks/useSkills.js';
import { Badge } from './ui/badge.jsx';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';
import { Input } from './ui/input.jsx';
import { Tabs } from './ui/tabs.jsx';

export function SkillMap({ userId }) {
  const [level, setLevel] = useState('todos');
  const [name, setName] = useState('');
  const { skills } = useSkills(userId, { level, name });
  const maxStrength = Math.max(100, ...skills.map((skill) => skill.strength));

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle>Mapa de habilidades</CardTitle>
        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <Input className="pl-9" placeholder="Filtrar habilidad" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <Tabs
            value={level}
            onChange={setLevel}
            tabs={[
              { value: 'todos', label: 'Todas' },
              { value: 'principiante', label: 'Inicial' },
              { value: 'intermedio', label: 'Intermedio' },
              { value: 'avanzado', label: 'Avanzado' }
            ]}
          />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {skills.length === 0 && <p className="text-sm text-slate-500">No hay habilidades para estos filtros.</p>}
        {skills.map((skill) => (
          <div key={skill.name}>
            <div
              className="flex min-w-[44%] items-center justify-between rounded-md bg-gradient-to-r from-emerald-200 to-sky-200 px-3 py-3 text-slate-950"
              style={{ width: `${Math.max(44, (skill.strength / maxStrength) * 100)}%` }}
            >
              <strong className="text-sm">{skill.name}</strong>
              <Badge variant="secondary">{skill.level}</Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {skill.evidenceCount} evidencia(s), {skill.validations} validaciones ponderadas
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
