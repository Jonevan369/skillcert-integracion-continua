import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { Badge } from '../components/ui/badge.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';

export function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('search') ?? '');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.users(params.get('search') ?? '').then(setUsers);
  }, [params]);

  function submit(event) {
    event.preventDefault();
    setParams(query ? { search: query } : {});
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-emerald-700">Explorar</p>
          <h1 className="text-3xl font-black">Usuarios y habilidades verificables</h1>
        </div>
        <form onSubmit={submit} className="w-full md:max-w-md">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="React, soldadura, Ana..." />
        </form>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Link to={`/profile/${user.id}`} key={user.id}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="space-y-3 pt-5">
                <div>
                  <h2 className="text-xl font-black">{user.name}</h2>
                  <p className="text-sm text-slate-500">{user.headline}</p>
                </div>
                <Badge variant="secondary">Karma {user.karma}</Badge>
                <div className="flex flex-wrap gap-2">
                  {user.topSkills.map((skill) => <Badge key={skill.name}>{skill.name}</Badge>)}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
