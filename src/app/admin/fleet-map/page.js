'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Pusher from 'pusher-js';

const MapWidget = dynamic(() => import('@/components/MapWidget'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading Map...
    </div>
  ),
});

export default function FleetMapPage() {
  const [vehicles, setVehicles] = useState({});

  useEffect(() => {
    // Initialize Pusher
    const pusher = new Pusher('driveos-key', {
      cluster: 'ap2',
    });

    const channel = pusher.subscribe('map-channel');
    
    channel.bind('location-update', (data) => {
      setVehicles((prev) => {
        const next = { ...prev };
        if (data.isEnded) {
          delete next[data.sessionId];
        } else {
          next[data.sessionId] = data;
        }
        return next;
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <header className="page-header">
        <div>
          <h1 className="page-title">Live Fleet Map</h1>
          <p className="page-description">Real-time telematics tracking for active instructor sessions.</p>
        </div>
      </header>
      
      <main>
        <div className="card" style={{ height: 'calc(100vh - 160px)', padding: 0 }}>
          <MapWidget vehicles={Object.values(vehicles)} />
        </div>
      </main>
    </div>
  );
}
