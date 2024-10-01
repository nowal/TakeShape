'use client';
import { PREFERENCES_COLOR_BRAND_RECORD } from '@/atom/constants';
import { TPreferencesColorKey } from '@/atom/types';
import { isPreferencesColorKey } from '@/atom/validation';
import {
  TPaintBrand,
  TColor,
} from '@/context/preferences/state/color/types';
import { useEffect, useState } from 'react';

const API_KEY =
  's4DVRG5JuBZ9SMbTUTqWpQ12R3iF7UXGGrzvNWQSDxQJiMtYKuXFEwTVTCK4vsDjsror9pSXbZt538ePykASuijcaJaynz';
const COLOR_API_ORIGIN = 'https://api.encycolorpedia.com';
const COLOR_API_VERSION = 'v1';

const COLOR_API_ROOT =
  `${COLOR_API_ORIGIN}/${COLOR_API_VERSION}` as const;
const COLOR_PAINTS_API_ROOT =
  `${COLOR_API_ROOT}/paints` as const;

export const usePreferencesStateColor = () => {
  const [paintBrands, setPaintBrands] = useState<
    TPaintBrand[]
  >([]);
  const [selectedBrandRecord, setSelectedBrandRecord] =
    useState<Record<TPreferencesColorKey, string>>(
      PREFERENCES_COLOR_BRAND_RECORD
    );

  // const [colorName, setColorName] = useState('');
  const [hexCode, setHexCode] = useState<string | null>(
    null
  );
  const [searchError, setSearchError] = useState('');

  const handleSelectBrandValueChange = (
    name: string,
    value: string
  ) => {
    if (isPreferencesColorKey(name)) {
      setSelectedBrandRecord((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    const fetchPaintBrands = async () => {
      try {
        const response = await fetch(
          COLOR_PAINTS_API_ROOT,
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

  const handleColorSearch = async (
    name: string,
    nextColor: string
  ) => {
    if (!isPreferencesColorKey(name)) {
      console.log('Incorrect name ', name);
      return;
    }

    const selectedBrand = selectedBrandRecord[name];

    const colorName = nextColor;
    console.log('handleColorSearch ');

    console.log(
      paintBrands,
      searchError,
      hexCode,
      selectedBrand
    );

    if (!selectedBrand) {
      const error = 'Please select a brand';
      setSearchError(error);
      console.error(error);
      return;
    }

    const searchQuery = `${selectedBrand} ${colorName}`;
    const url =
      `${COLOR_API_ROOT}/search?q=${searchQuery}` as const;

    try {
      // 1. Initial search using /v1/search
      const searchResponse = await fetch(url, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });

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
        COLOR_PAINTS_API_ROOT,
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
          .flatMap((values) => values)
          .find(
            (value) =>
              value.brand.toLowerCase() ===
                selectedBrand.toLowerCase() &&
              value.name
                .toLowerCase()
                .includes(colorName.toLowerCase())
          );

        setHexCode(potentialHexCode);
        // setColorName(matchingColor?.name || ''); <---
        // setPreferences((prev) => ({
        //   ...prev,
        //   color: matchingColor?.name || '',
        // })); <---
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
      } else {
        setHexCode(null);
        setSearchError('Color match not found');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setSearchError('An error occurred during the search');
    }
  };

  return {
    paintBrands,
    searchError,
    hexCode,
    selectedBrandRecord,
    onSelectBrandValueChange: handleSelectBrandValueChange,
    dispatchSelectedBrand: setSelectedBrandRecord,
    onColorSearch: handleColorSearch,
  };
};
