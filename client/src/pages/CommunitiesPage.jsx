import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Badge } from '../components/ui/badge.jsx';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Input, Textarea } from '../components/ui/input.jsx';

export function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [form, setForm] = useState({ name: '', area: '', description: '' });

  async function refresh() {
    setCommunities(await api.communities());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function create(event) {
    event.preventDefault();
    await api.createCommunity(form);
    setForm({ name: '', area: '', description: '' });
    refresh();
  }

  async function join(id) {
    await api.joinCommunity(id);
    refresh();
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Nueva comunidad</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="grid gap-3">
            <Input placeholder="Nombre" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input placeholder="Area de conocimiento" value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} />
            <Textarea placeholder="Descripcion" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            <Button>Crear comunidad</Button>
          </form>
        </CardContent>
      </Card>
      <section className="grid gap-4 md:grid-cols-2">
        {communities.map((community) => (
          <Card key={community.id}>
            <CardContent className="space-y-3 pt-5">
              <div>
                <h2 className="text-xl font-black">{community.name}</h2>
                <p className="text-sm text-slate-500">{community.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="blue">{community.area}</Badge>
                <Badge variant="secondary">{community.memberCount} miembros</Badge>
                <Badge variant="secondary">{community.evidenceCount} evidencias</Badge>
              </div>
              <Button variant="outline" onClick={() => join(community.id)}>Unirme</Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
