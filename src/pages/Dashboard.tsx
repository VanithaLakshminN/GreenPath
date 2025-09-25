import React, { useEffect, useMemo, useState } from 'react';
import { Leaf, Award, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { listJourneys } from '../services/journeys';
import { awardPointsForDistance, badgesFromPoints } from '../services/gamification';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [journeys, setJourneys] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const userId = 'demo-user';
        const js = await listJourneys(userId);
        if (!mounted) return;
        setJourneys(js);
      } catch (e) {
        setError('Failed to load journeys');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const totals = useMemo(() => {
    const totalCo2 = journeys.reduce((a, j) => a + (j.co2SavedKg || 0), 0);
    const totalKm = journeys.reduce((a, j) => a + (j.metrics?.distanceKm || 0), 0);
    const points = awardPointsForDistance(totalKm);
    const badges = badgesFromPoints(points);
    return { totalCo2, points, badges };
  }, [journeys]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Eco Impact Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-gray-500 text-sm mb-1">Total CO₂ Saved</div>
            <div className="text-2xl font-bold text-green-700 flex items-center gap-2"><Leaf className="w-6 h-6" />{totals.totalCo2.toFixed(1)} kg</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-gray-500 text-sm mb-1">Points Earned</div>
            <div className="text-2xl font-bold text-blue-700">{totals.points}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-gray-500 text-sm mb-1">Badges</div>
            <div className="flex gap-2 flex-wrap">
              {totals.badges.length === 0 && <span className="text-gray-600">No badges yet</span>}
              {totals.badges.map((b) => (
                <span key={b.id} className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"><Award className="w-4 h-4" />{b.name}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Journey History</h2>
          {loading && <div className="text-gray-600">Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && journeys.length === 0 && <div className="text-gray-600">No journeys yet.</div>}
          <div className="space-y-4">
            {journeys.map((j) => (
              <div key={j.id} className="border rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-gray-900">{j.sourceText} → {j.destinationText}</div>
                  <div className="text-sm text-gray-600">{new Date(j.completedAt).toLocaleString()}</div>
                </div>
                <div className="text-sm text-gray-700">{j.mode} • {j.metrics.distanceKm.toFixed(1)} km • {(j.metrics.durationSeconds/60|0)} min • {j.metrics.co2Kg.toFixed(1)} kg CO₂</div>
                {Array.isArray(j.media) && j.media.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {j.media.map((m: any, idx: number) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">{m.kind === 'photo' ? <ImageIcon className="w-3 h-3" /> : <VideoIcon className="w-3 h-3" />}Media</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


