import { useState, useEffect, useCallback } from 'react';
import virtualEnvironmentService from '../services/virtualEnvironmentService';

interface Environment {
  id: string;
  name: string;
  [key: string]: any;
}

interface EnvironmentOptions {
  [key: string]: any;
}

/**
 * Hook for managing virtual environment state
 */
export function useVirtualEnvironment() {
  const [currentEnvironment, setCurrentEnvironmentState] = useState<Environment>(
    virtualEnvironmentService.getCurrentEnvironment()
  );

  const setEnvironment = useCallback((environmentId: string, options: EnvironmentOptions = {}): Environment => {
    const env = virtualEnvironmentService.setEnvironment(environmentId, options);
    setCurrentEnvironmentState(env);
    return env;
  }, []);

  const setWeather = useCallback((weatherType: string) => {
    virtualEnvironmentService.setWeather(weatherType);
    setCurrentEnvironmentState(virtualEnvironmentService.getCurrentEnvironment());
  }, []);

  const setTimeOfDay = useCallback((timeOfDay: string) => {
    virtualEnvironmentService.setTimeOfDay(timeOfDay);
    setCurrentEnvironmentState(virtualEnvironmentService.getCurrentEnvironment());
  }, []);

  const getAvailableEnvironments = useCallback((): Environment[] => {
    return virtualEnvironmentService.getAvailableEnvironments();
  }, []);

  const getEnvironmentBonus = useCallback((challengeType: string): number => {
    return virtualEnvironmentService.getEnvironmentBonus(challengeType);
  }, []);

  const getThemeColors = useCallback((): Record<string, string> => {
    return virtualEnvironmentService.getThemeColors();
  }, []);

  return {
    currentEnvironment,
    setEnvironment,
    setWeather,
    setTimeOfDay,
    getAvailableEnvironments,
    getEnvironmentBonus,
    getThemeColors
  };
}

