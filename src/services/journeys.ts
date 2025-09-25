import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../firebase';
import { JourneyRecord, RouteMetrics, TravelMode } from '../types';

const COLLECTION = 'journeys';

export async function saveJourney(params: {
  userId: string;
  sourceText: string;
  destinationText: string;
  mode: TravelMode;
  routeId: string;
  metrics: RouteMetrics;
  co2SavedKg?: number;
  media?: JourneyRecord['media'];
}): Promise<string> {
  const now = Date.now();
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTION), {
    userId: params.userId,
    sourceText: params.sourceText,
    destinationText: params.destinationText,
    mode: params.mode,
    routeId: params.routeId,
    metrics: params.metrics,
    co2SavedKg: params.co2SavedKg ?? 0,
    media: params.media ?? [],
    startedAt: now,
    completedAt: now,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function listJourneys(userId: string): Promise<JourneyRecord[]> {
  const db = getDb();
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const results: JourneyRecord[] = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data() as any;
    if (data.userId !== userId) return;
    results.push({
      id: docSnap.id,
      userId: data.userId,
      sourceText: data.sourceText,
      destinationText: data.destinationText,
      mode: data.mode,
      routeId: data.routeId,
      metrics: data.metrics,
      co2SavedKg: data.co2SavedKg,
      startedAt: data.startedAt,
      completedAt: data.completedAt,
      media: data.media ?? [],
    });
  });
  return results;
}


