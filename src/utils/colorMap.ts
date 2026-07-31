import type { EventProducer } from '../types/hub';

export const colorMap: Record<EventProducer, string> = {
  synapse: '#06B6D4',
  sugarGlider: '#F97316',
  languageIntelligence: '#8B5CF6',
  redisStreams: '#F59E0B',
  realtimeGateway: '#22C55E',
};

export const errorColor = '#EF4444';

export const producerLabels: Record<EventProducer, string> = {
  synapse: 'Synapse',
  sugarGlider: 'Sugar Glider',
  languageIntelligence: 'Language Intelligence',
  redisStreams: 'Redis Streams',
  realtimeGateway: 'Realtime Gateway',
};

export const PRODUCERS: EventProducer[] = [
  'synapse',
  'sugarGlider',
  'languageIntelligence',
  'redisStreams',
  'realtimeGateway',
];
