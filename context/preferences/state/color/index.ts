import {
  NONE_SELECT_PAINT_BRAND,
  PREFERENCES_COLOR_BRAND_MATCHES_RECORD,
  PREFERENCES_COLOR_BRAND_RECORD,
} from '@/atom/constants';
import { TPreferencesColorKey } from '@/atom/types';
import { isPreferencesColorKey } from '@/atom/validation';
import { INPUTS_NAME_DELIMITER } from '@/constants/inputs';
import {
  TPaintBrand,
  TColor,
} from '@/context/preferences/state/color/types';
import { TPaintPreferences } from '@/types';
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

const API_KEY =
  's4DVRG5JuBZ9SMbTUTqWpQ12R3iF7UXGGrzvNWQSDxQJiMtYKuXFEwTVTCK4vsDjsror9pSXbZt538ePykASuijcaJaynz';
const COLOR_API_ORIGIN = 'https://api.encycolorpedia.com';
const COLOR_API_VERSION = 'v1';

const COLOR_API_ROOT =
  `${COLOR_API_ORIGIN}/${COLOR_API_VERSION}` as const;
const COLOR_PAINTS_API_ROOT =
  `${COLOR_API_ROOT}/paints` as const;

type TConfig = {
  dispatchPreferences: Dispatch<
    SetStateAction<TPaintPreferences>
  >;
};
export const usePreferencesStateColor = ({
  dispatchPreferences,
}: TConfig) => {
  const [paintBrands, setPaintBrands] = useState<
    TPaintBrand[]
  >([]);
  const [selectedBrandRecord, setSelectedBrandRecord] =
    useState<Record<TPreferencesColorKey, string>>(
      PREFERENCES_COLOR_BRAND_RECORD
    );
  const [
    selectedBrandMatchesRecord,
    setSelectedBrandMatchesRecord,
  ] = useState<
    Record<TPreferencesColorKey, readonly TColor[]>
  >(PREFERENCES_COLOR_BRAND_MATCHES_RECORD);

  const [hexCode, setHexCode] = useState<string | null>(
    null
  );
  const [searchError, setSearchError] = useState('');

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
        const paintBrands: TPaintBrand[] =
          await response.json();
        setPaintBrands([
          NONE_SELECT_PAINT_BRAND,
          ...paintBrands,
        ]);
      } catch (err) {
        console.error('Error fetching paint brands:', err);
      }
    };

    fetchPaintBrands();
  }, []);

  const handleColorSearch = async (
    name: TPreferencesColorKey,
    selectedBrand: string = selectedBrandRecord[name],
  ) => {
    const preferencesColorKey: TPreferencesColorKey = name;

    console.log('handleColorSearch ');

    if (!selectedBrand) {
      const error = 'Please select a brand';
      setSearchError(error);
      console.error(error);
      return;
    }

    console.log(name, selectedBrand, hexCode);

    // const searchQuery =selectedBrand;// `${selectedBrand} ${nextColor}`;
    const url =
      `${COLOR_API_ROOT}/search?q=${selectedBrand}&offset=0&limit=20` as const; // 20 is max
    //  `${COLOR_API_ROOT}/search?q=${searchQuery}` as const;

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
      setSelectedBrandMatchesRecord((prev) => ({
        ...prev,
        [name]: searchData.result.colors,
      }));

      return;
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
            selectedBrand.toLowerCase()
          //   &&
          // color.name
          //   .toLowerCase()
          //   .includes(nextColor.toLowerCase())
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
              selectedBrand.toLowerCase()
            //   &&
            // value.name
            //   .toLowerCase()
            //   .includes(nextColor.toLowerCase())
          );
        console.log(matchingColor, matchData);
        setHexCode(potentialHexCode);
        setSearchError(''); // Clear any previous search errors
        // Update defaultPreferences with the found color name and hex code
        dispatchPreferences((prev: TPaintPreferences) => ({
          ...prev,
          [preferencesColorKey]: matchingColor?.name || '',
        }));
        // setSelectedBrandMatchesRecord((prev) => ({
        //   ...prev,
        //   [preferencesColorKey]: matchingColor?.name || '',
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

  const handleSelectBrandValueChange = (
    namePath: string,
    value: string
  ) => {
    const [_, name] = namePath.split(INPUTS_NAME_DELIMITER);
    if (isPreferencesColorKey(name)) {
      dispatchPreferences((prev: TPaintPreferences) => ({
        ...prev,
        [name]: undefined,
      }));
      setSelectedBrandRecord((prev) => ({
        ...prev,
        [name]: value,
      }));
      handleColorSearch(name, value);
    }
  };

  return {
    paintBrands,
    searchError,
    hexCode,
    selectedBrandRecord,
    selectedBrandMatchesRecord,

    onSelectBrandValueChange: handleSelectBrandValueChange,
    dispatchSelectedBrand: setSelectedBrandRecord,
  };
};
