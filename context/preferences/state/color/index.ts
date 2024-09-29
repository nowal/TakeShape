'use client';;
import { defaultPreferencesAtom } from '@/atom';
import { TPreferencesColorConfig, TPaintBrand, TColor } from '@/context/preferences/state/color/types';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';

export const usePreferencesStateColor = (config:TPreferencesColorConfig) => {
  const [defaultPreferences, setPreferences] = useAtom(
    defaultPreferencesAtom
  );
  const [paintBrands, setPaintBrands] = useState<
    TPaintBrand[]
  >([]);
  const [selectedBrand, setSelectedBrand] = useState<
    string | null
  >(null);
  const [colorName, setColorName] = useState('');
  const [hexCode, setHexCode] = useState<string | null>(
    null
  );
  const [searchError, setSearchError] = useState('');

  const API_KEY =
    's4DVRG5JuBZ9SMbTUTqWpQ12R3iF7UXGGrzvNWQSDxQJiMtYKuXFEwTVTCK4vsDjsror9pSXbZt538ePykASuijcaJaynz';

  useEffect(() => {
    const fetchPaintBrands = async () => {
      try {
        const response = await fetch(
          `https://api.encycolorpedia.com/v1/paints`,
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
            },
          }
        );
        const data: TPaintBrand[] = await response.json();
        setPaintBrands(data);
      } catch (err) {
        console.error('Error fetching paint brands:', err);
      }
    };

    fetchPaintBrands();
  }, []);

  const handleColorSearch = async () => {
    console.log('handleColorSearch');
    if (!selectedBrand) {
      setSearchError('Please select a brand');
      return;
    }

    const searchQuery = `${selectedBrand} ${colorName}`;

    try {
      // 1. Initial search using /v1/search
      const searchResponse = await fetch(
        `https://api.encycolorpedia.com/v1/search?q=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      if (!searchResponse.ok) {
        throw new Error(
          `Initial search failed with status ${searchResponse.status}`
        );
      }

      const searchData = await searchResponse.json();
      console.log('Initial search result:', searchData);

      const potentialHexCode = searchData.color;

      // 2. Verification using /v1/paints (POST)
      const matchResponse = await fetch(
        `https://api.encycolorpedia.com/v1/paints`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([potentialHexCode]),
        }
      );

      if (!matchResponse.ok) {
        throw new Error(
          `Match request failed with status ${matchResponse.status}`
        );
      }

      const matchData = await matchResponse.json();
      console.log('Match result:', matchData);

      const isMatch = Object.values(
        matchData as { [key: string]: TColor[] }
      ).some((colors: TColor[]) =>
        colors.some(
          (color) =>
            color.brand.toLowerCase() ===
              selectedBrand.toLowerCase() &&
            color.name
              .toLowerCase()
              .includes(colorName.toLowerCase())
        )
      );

      if (isMatch) {
        // Find the first matching color to get its full name
        const matchingColor = Object.values(
          matchData as { [key: string]: TColor[] }
        )
          .flatMap((colors) => colors)
          .find(
            (color) =>
              color.brand.toLowerCase() ===
                selectedBrand.toLowerCase() &&
              color.name
                .toLowerCase()
                .includes(colorName.toLowerCase())
          );

        setHexCode(potentialHexCode);
        setColorName(matchingColor?.name || '');
        setSearchError(''); // Clear any previous search errors

        // Update defaultPreferences with the found color name and hex code
        // dis((prev) => ({
        //   ...prev,
        //   color: matchingColor?.name || '',
        // }));
        // setDefaultPreferences((prev) => ({
        //   ...prev,
        //   color: matchingColor?.name || '',
        // }));
        setPreferences((prev) => ({
          ...prev,
          color: matchingColor?.name || '',
        }));
      } else {
        setHexCode(null);
        setSearchError('Color match not found');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setSearchError('An error occurred during the search');
    }
  };
  console.log( paintBrands,
    searchError,
    hexCode,
    selectedBrand);

  return {
    paintBrands,
    searchError,
    hexCode,
    selectedBrand,
    dispatchSelectedBrand: setSelectedBrand,
    onColorSearch: handleColorSearch,
  };
};
