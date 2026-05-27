import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: 'ana@example.com', password: 'password123' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await login(form);
      navigate('/dashboard');
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-emerald-500 text-slate-950">
            <Award />
          </div>
          <CardTitle className="text-2xl">Entrar a SkillCert</CardTitle>
          <p className="text-sm text-slate-500">Demo: ana@example.com / password123</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-3">
            <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" />
            <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Contraseña" />
            {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <Button>Iniciar sesion</Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            ¿Nuevo aqui? <Link className="font-bold text-emerald-700" to="/register">Crear cuenta</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
