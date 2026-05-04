'use client';

import { useEffect, useMemo, useState } from 'react';
import firebase from '@/lib/firebase';
import { getAuth, onAuthStateChanged } from '@/lib/auth';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  setDoc,
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useSession } from '@/context/session/provider';
import Nango from '@nangohq/frontend';

type CrmRecord = {
  id: string;
  name: string;
  nangoIntegrationId: string;
};

type NangoSessionResponse = {
  data?: {
    token?: string;
  };
  token?: string;
};

const DEFAULT_CRMS: Array<Omit<CrmRecord, 'id'> & { id: string }> = [
  {
    id: 'jobber',
    name: 'Jobber',
    nangoIntegrationId: 'jobber',
  },
  {
    id: 'netsuite',
    name: 'NetSuite',
    nangoIntegrationId: 'netsuite',
  },
];

export default function IntegratePage() {
  const [search, setSearch] = useState('');
  const [crms, setCrms] = useState<CrmRecord[]>([]);
  const [isLoadingCrms, setIsLoadingCrms] = useState(true);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [authUserEmail, setAuthUserEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { sessionId } = useSession();

  useEffect(() => {
    const auth = getAuth(firebase);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUserId(user?.uid ?? null);
      setAuthUserEmail(user?.email ?? null);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadCrms = async () => {
      setIsLoadingCrms(true);

      try {
        const db = getFirestore(firebase);
        const crmsCollection = collection(db, 'crms');
        const snapshot = await getDocs(crmsCollection);

        if (snapshot.empty) {
          await Promise.all(
            DEFAULT_CRMS.map((crm) =>
              setDoc(doc(db, 'crms', crm.id), {
                name: crm.name,
                nangoIntegrationId: crm.nangoIntegrationId,
              })
            )
          );

          const seededSnapshot = await getDocs(crmsCollection);
          const seededCrms = seededSnapshot.docs.map((docSnap) => {
            const data = docSnap.data() as {
              name?: string;
              nangoIntegrationId?: string;
            };

            return {
              id: docSnap.id,
              name: data.name || docSnap.id,
              nangoIntegrationId:
                data.nangoIntegrationId || docSnap.id,
            };
          });

          setCrms(seededCrms);
          return;
        }

        const records = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as {
            name?: string;
            nangoIntegrationId?: string;
          };

          return {
            id: docSnap.id,
            name: data.name || docSnap.id,
            nangoIntegrationId: data.nangoIntegrationId || docSnap.id,
          };
        });

        setCrms(records);
      } catch (error) {
        console.error('Failed to load crms collection:', error);
        toast.error('Failed to load CRM list from Firebase.');
      } finally {
        setIsLoadingCrms(false);
      }
    };

    void loadCrms();
  }, []);

  const filteredCrms = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return crms;

    return crms.filter((crm) =>
      crm.name.toLowerCase().includes(needle)
    );
  }, [crms, search]);

  const connectCrm = async (crm: CrmRecord) => {
    const resolvedUserId = authUserId || sessionId;
    if (!resolvedUserId) {
      toast.error('Unable to initialize session. Please refresh and try again.');
      return;
    }

    setIsConnecting(true);

    try {
      const response = await fetch('/api/integrations/nango/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integrationId: crm.nangoIntegrationId,
          userId: resolvedUserId,
          userEmail: authUserEmail,
        }),
      });

      const payload = (await response.json()) as NangoSessionResponse & {
        error?: string;
        details?: unknown;
      };

      if (!response.ok) {
        const message = payload.error || 'Unable to create Nango session.';
        throw new Error(message);
      }

      const sessionToken = payload.data?.token || payload.token;
      if (!sessionToken) {
        throw new Error('No session token returned by Nango.');
      }

      const nango = new Nango();
      const connect = nango.openConnectUI({
        onEvent: (event) => {
          if (event?.type === 'connect' || event?.type === 'success') {
            toast.success(`${crm.name} authorized successfully.`);
            setIsConnecting(false);
          }

          if (event?.type === 'close') {
            setIsConnecting(false);
          }

          if (event?.type === 'error') {
            toast.error(`Failed to authorize ${crm.name}.`);
            setIsConnecting(false);
          }
        },
      });
      connect.setSessionToken(sessionToken);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to open Nango authorization.';
      console.error(message);
      toast.error(message);
      setIsConnecting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">Integrate CRM</h1>
      <p className="mt-2 text-sm text-slate-600">
        Search and connect a CRM with Nango.
      </p>

      <div className="mt-8 relative">
        <label htmlFor="crm-search" className="mb-2 block text-sm font-medium">
          CRM Search
        </label>
        <input
          id="crm-search"
          type="text"
          autoComplete="off"
          placeholder="Start typing (e.g. jobber, netsuite)"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
        />

        {isDropdownOpen && (
          <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            {isLoadingCrms ? (
              <p className="px-4 py-3 text-sm text-slate-500">Loading CRMs...</p>
            ) : filteredCrms.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">No matches found.</p>
            ) : (
              filteredCrms.map((crm) => (
                <button
                  key={crm.id}
                  type="button"
                  className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm transition hover:bg-slate-50"
                  onClick={() => {
                    setSearch(crm.name);
                    setDropdownOpen(false);
                    void connectCrm(crm);
                  }}
                  disabled={isConnecting}
                >
                  {crm.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Search is capitalization agnostic.
      </p>
    </main>
  );
}
