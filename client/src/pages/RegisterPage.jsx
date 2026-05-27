import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', headline: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    try {
      await register(form);
      navigate('/dashboard');
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Crear identidad competencial</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-3">
            <Input placeholder="Nombre" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <Input placeholder="Titular profesional" value={form.headline} onChange={(event) => setForm({ ...form, headline: event.target.value })} />
            <Input placeholder="Contraseña" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <Button>Registrarme</Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            Ya tengo cuenta <Link className="font-bold text-emerald-700" to="/login">Entrar</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
