import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';

const LEVEL_Y = { principiante: 120, intermedio: 70, avanzado: 25 };

export function ProgressChart({ userId, skill }) {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (!skill) return;
    api.progress(userId, skill).then(setPoints).catch(() => setPoints([]));
  }, [userId, skill]);

  const path = points
    .map((point, index) => {
      const x = points.length === 1 ? 140 : 20 + (index * 260) / Math.max(1, points.length - 1);
      const y = LEVEL_Y[point.level] ?? 120;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progreso: {skill || 'selecciona una habilidad'}</CardTitle>
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <p className="text-sm text-slate-500">Sin datos suficientes para graficar.</p>
        ) : (
          <svg viewBox="0 0 300 150" className="h-44 w-full">
            <line x1="20" y1="120" x2="280" y2="120" stroke="#cbd5e1" />
            <line x1="20" y1="70" x2="280" y2="70" stroke="#cbd5e1" />
            <line x1="20" y1="25" x2="280" y2="25" stroke="#cbd5e1" />
            <path d={path} fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
            {points.map((point, index) => {
              const x = points.length === 1 ? 140 : 20 + (index * 260) / Math.max(1, points.length - 1);
              const y = LEVEL_Y[point.level] ?? 120;
              return <circle key={`${point.date}-${index}`} cx={x} cy={y} r="5" fill="#0f766e" />;
            })}
          </svg>
        )}
      </CardContent>
    </Card>
  );
}
