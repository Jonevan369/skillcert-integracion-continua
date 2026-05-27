import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileJson, ShieldCheck } from 'lucide-react';
import { api } from '../api/client.js';
import { EvidenceCard } from '../components/EvidenceCard.jsx';
import { ProgressChart } from '../components/ProgressChart.jsx';
import { SkillMap } from '../components/SkillMap.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useFollow } from '../hooks/useFollow.js';
import { downloadJson } from '../lib/utils.js';

export function ProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState('');
  const follow = useFollow(profile?.isFollowing ?? false);

  async function refresh() {
    const next = await api.profile(userId);
    setProfile(next);
    setSelectedSkill(next.evidences?.[0]?.suggestions?.[0]?.name ?? '');
  }

  useEffect(() => {
    refresh().catch(() => {});
  }, [userId]);

  const allSkills = useMemo(() => {
    const names = new Set();
    profile?.evidences?.forEach((evidence) => evidence.suggestions.forEach((skill) => names.add(skill.name)));
    return [...names];
  }, [profile]);

  if (!profile) return <main className="p-6">Cargando perfil...</main>;
  const ownProfile = user?.id === Number(userId);

  async function exportProfile() {
    const payload = await api.exportProfile(userId);
    downloadJson(`skillcert-profile-${userId}.json`, payload);
  }

  async function mint(badgeId) {
    const payload = await api.mintCredential(badgeId);
    downloadJson(`skillcert-credential-${badgeId}.json`, payload);
    refresh();
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-3xl font-black">{profile.user.name}</h1>
                <p className="text-slate-500">{profile.user.headline}</p>
              </div>
              {!ownProfile && (
                <Button onClick={() => follow.toggle(userId)} variant={follow.following ? 'secondary' : 'default'}>
                  {follow.following ? 'Siguiendo' : 'Seguir'}
                </Button>
              )}
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{profile.user.bio}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Karma {profile.user.karma}</Badge>
              <Badge>{profile.stats.followers} seguidores</Badge>
              <Badge>{profile.stats.following} siguiendo</Badge>
            </div>
            {ownProfile && (
              <Button variant="outline" onClick={exportProfile}>
                <Download size={17} />
                Exportar perfil JSON
              </Button>
            )}
          </CardContent>
        </Card>

        <SkillMap userId={userId} />

        <Card>
          <CardContent className="space-y-3 pt-5">
            <h2 className="text-lg font-black">Badges</h2>
            <div className="grid gap-3">
              {profile.badges.length === 0 && <p className="text-sm text-slate-500">Aun no hay badges automaticos.</p>}
              {profile.badges.map((badge) => (
                <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3 dark:bg-slate-900" key={badge.id}>
                  <div>
                    <p className="font-bold">{badge.title}</p>
                    <p className="text-xs text-slate-500">Umbral {badge.threshold} · {badge.mintedHash ? 'Credencial emitida' : 'Pendiente de acuñar'}</p>
                  </div>
                  {ownProfile && (
                    <Button size="sm" variant="secondary" onClick={() => mint(badge.id)}>
                      {badge.mintedHash ? <ShieldCheck size={16} /> : <FileJson size={16} />}
                      VC
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-5">
            <h2 className="text-lg font-black">Habilidad para progreso</h2>
            <select
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
              value={selectedSkill}
              onChange={(event) => setSelectedSkill(event.target.value)}
            >
              {allSkills.map((skill) => <option key={skill}>{skill}</option>)}
            </select>
          </CardContent>
        </Card>
        <ProgressChart userId={userId} skill={selectedSkill} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-black">Evidencias</h2>
        {profile.evidences.map((evidence) => <EvidenceCard evidence={evidence} onChanged={refresh} key={evidence.id} />)}
      </section>
    </main>
  );
}
