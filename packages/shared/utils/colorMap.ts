import type { EventProducer } from '../types/index.js';

export const colorMap: Record<EventProducer, string> = {
  synapse: '#06B6D4',                       //Teal
  sugarGlider: '#F97316',                   //Orange
  languageIntelligence: '#8B5CF6',          //Violet
  redisStreams: '#F59E0B',                  //Amber
  realtimeGateway: '#22C55E',               //Green
};

/** Error events — same across all lanes*/
export const errorColor = '#EF4444';        //Red
