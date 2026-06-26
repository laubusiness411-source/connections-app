import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Persisted Discover filters for jobs and people.

const KEY = '@goalmatch/filters';

const DEFAULTS = {
  jobs: { types: [], states: [], includeRemote: true, minPay: 0, maxCommute: 9999 },
  people: { roles: [], lookingFor: [], states: [], includeRemote: true },
};

const FiltersContext = createContext(null);
export const useFilters = () => useContext(FiltersContext) || { ...DEFAULTS };

export function FiltersProvider({ children }) {
  const [jobs, setJobsState] = useState(DEFAULTS.jobs);
  const [people, setPeopleState] = useState(DEFAULTS.people);
  const ref = useRef({ jobs: DEFAULTS.jobs, people: DEFAULTS.people });

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          const next = {
            jobs: { ...DEFAULTS.jobs, ...(saved.jobs || {}) },
            people: { ...DEFAULTS.people, ...(saved.people || {}) },
          };
          ref.current = next;
          setJobsState(next.jobs);
          setPeopleState(next.people);
        }
      } catch {
        // keep defaults
      }
    })();
  }, []);

  const persist = useCallback(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(ref.current)).catch(() => {});
  }, []);

  const setJobs = useCallback(
    (partial) => {
      setJobsState((prev) => {
        const next = { ...prev, ...partial };
        ref.current = { ...ref.current, jobs: next };
        persist();
        return next;
      });
    },
    [persist]
  );

  const setPeople = useCallback(
    (partial) => {
      setPeopleState((prev) => {
        const next = { ...prev, ...partial };
        ref.current = { ...ref.current, people: next };
        persist();
        return next;
      });
    },
    [persist]
  );

  const resetJobs = useCallback(() => setJobs({ ...DEFAULTS.jobs }), [setJobs]);
  const resetPeople = useCallback(
    () => setPeople({ ...DEFAULTS.people }),
    [setPeople]
  );

  const value = useMemo(
    () => ({ jobs, people, setJobs, setPeople, resetJobs, resetPeople }),
    [jobs, people, setJobs, setPeople, resetJobs, resetPeople]
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

// Count of active (non-default) filters, for the badge.
export function activeJobCount(f) {
  let n = 0;
  if (f.types?.length) n++;
  if (f.states?.length) n++;
  if (!f.includeRemote) n++;
  if (f.minPay > 0) n++;
  if (f.maxCommute < 9999) n++;
  return n;
}
export function activePeopleCount(f) {
  let n = 0;
  if (f.roles?.length) n++;
  if (f.lookingFor?.length) n++;
  if (f.states?.length) n++;
  if (!f.includeRemote) n++;
  return n;
}
