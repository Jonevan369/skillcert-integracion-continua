import React, { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { api } from '../api/client.js';
import { Button } from './ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';
import { Input, Textarea } from './ui/input.jsx';

export function EvidenceForm({ onCreated }) {
  const [communities, setCommunities] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', communityId: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.communities().then(setCommunities).catch(() => setCommunities([]));
  }, []);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    await api.createEvidence({
      title: form.title,
      body: form.body,
      communityId: form.communityId ? Number(form.communityId) : null
    });
    setForm({ title: '', body: '', communityId: '' });
    setLoading(false);
    onCreated?.();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva evidencia</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-3">
          <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Titulo breve" required />
          <Textarea
            value={form.body}
            onChange={(event) => setForm({ ...form, body: event.target.value })}
            placeholder="Describe que hiciste, herramientas, resultados y contexto."
            required
          />
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            value={form.communityId}
            onChange={(event) => setForm({ ...form, communityId: event.target.value })}
          >
            <option value="">Publicar solo en mi perfil</option>
            {communities.map((community) => (
              <option value={community.id} key={community.id}>
                {community.name}
              </option>
            ))}
          </select>
          <Button disabled={loading}>
            <Send size={17} />
            {loading ? 'Analizando...' : 'Registrar evidencia'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
