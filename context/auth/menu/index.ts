'use client';
import { useState, useEffect, useRef } from 'react';
import { getAuth } from '@/lib/auth';
import { useOutsideClick } from '@/hooks/outside-click';
import { TAuthConfig } from '@/context/auth/types';
import { isAgentAtom, isPainterAtom } from '@/atom';
import { useAtom } from 'jotai';
import { useApp } from '@/context/app/provider';
import firebase from '@/lib/firebase';
import { onAuthStateChanged, type User } from '@/lib/auth';

export const useAuthMenu = (config: TAuthConfig) => {
  const { onNavigateScrollTopClick } = useApp();
  const { dispatchProfilePictureUrl } = config;
  const [isFetchingProfilePicture, setFetchingProfilePicture] = useState(true);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isPainter, setPainter] = useAtom(isPainterAtom);
  const [isAgent, setAgent] = useAtom(isAgentAtom);
  const auth = getAuth(firebase);
  const resolvedUidRef = useRef<string | null>(null);

  const fetchProfilePicture = async (currentUser: User | null) => {
    try {
      setFetchingProfilePicture(true);
      if (!currentUser) {
        setPainter(false);
        setAgent(false);
        dispatchProfilePictureUrl(null);
        return;
      }

      const response = await fetch(
        `/api/providers/by-user?userId=${encodeURIComponent(
          currentUser.uid
        )}&_ts=${Date.now()}`,
        {
          cache: 'no-store',
          headers: {
            'cache-control': 'no-cache',
            pragma: 'no-cache',
          },
        }
      );
      const payload = await response.json().catch(() => ({}));
      const provider = payload?.provider as
        | Record<string, unknown>
        | null;
      if (provider?.id) {
        setPainter(true);
        setAgent(false);
        const logoUrl = String(provider.logo_url || '').trim();
        if (logoUrl) {
          dispatchProfilePictureUrl(logoUrl);
        }
        return;
      } else {
        setPainter(false);
        setAgent(false);
      }
    } catch (error) {
      console.error(
        'Error fetching profile picture:',
        error
      );
    } finally {
      setFetchingProfilePicture(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        const nextUid = user?.uid || null;
        if (resolvedUidRef.current === nextUid) {
          return;
        }
        resolvedUidRef.current = nextUid;
        void fetchProfilePicture(user);
      },
      () => {
        setFetchingProfilePicture(false);
      }
    );

    return unsubscribe;
  }, []);

  const handleMenuOpenToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleDropdownClose = () => setMenuOpen(false);

  const handleDashboardClick = async () => {
    if (isAgent) {
      onNavigateScrollTopClick('/agentDashboard');
    } else {
      onNavigateScrollTopClick('/quotes');
    }
    window.scrollTo(0, 0);
    handleDropdownClose();
  };
  const outsideClickRef = useOutsideClick(
    handleDropdownClose
  );

  return {
    isMenuOpen,
    isAgent,
    isPainter,
    isFetchingProfilePicture,
    outsideClickRef,
    onMenuOpenToggle: handleMenuOpenToggle,
    onDashboardClick: handleDashboardClick,
    dispatchMenuOpen: setMenuOpen,
  };
};
