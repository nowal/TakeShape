import {
  NONE_SELECT_PAINT_BRAND,
  OTHER_SELECT_PAINT_BRAND,
  SELECT_SELECT_PAINT_BRAND,
  CUSTOM_SELECT_PAINT_BRAND,
  UNDECIDED_SELECT_PAINT_BRAND,
  PREFERENCES_COLOR_BRAND_MATCHES_RECORD,
  PREFERENCES_COLOR_BRAND_RECORD,
} from '@/atom/constants';
import { TPreferencesColorKey } from '@/atom/types';
import { isPreferencesColorKey } from '@/atom/validation';
import { INPUTS_NAME_DELIMITER } from '@/constants/inputs';
import { usePreferences } from '@/context/preferences/provider';
import { TPaintBrand, TColor } from '@/hooks/color/types';
import { TPaintPreferences } from '@/types/preferences';
import { useEffect, useState } from 'react';


const API_KEY =
  's4DVRG5JuBZ9SMbTUTqWpQ12R3iF7UXGGrzvNWQSDxQJiMtYKuXFEwTVTCK4vsDjsror9pSXbZt538ePykASuijcaJaynz';
const COLOR_API_ORIGIN = 'https://api.encycolorpedia.com';
const COLOR_API_VERSION = 'v1';

const COLOR_API_ROOT =
  `${COLOR_API_ORIGIN}/${COLOR_API_VERSION}` as const;
const COLOR_PAINTS_API_ROOT =
  `${COLOR_API_ROOT}/paints` as const;

const ALLOWED_PAINT_BRANDS = [
    "Sherwin-Williams",
    "Benjamin Moore",
    "Behr",
    "Valspar Paint",
    "Glidden",
    "PPG Pittsburgh Paints",
    "Porter Paints",
    "California Paints",
    "Farrow & Ball",
    "Pantone / PMS",
  ];

export const usePreferencesStateColor = () => {
  const { dispatchPreferences } = usePreferences();
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
        const response = await fetch(COLOR_PAINTS_API_ROOT, {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        });
        const paintBrands: TPaintBrand[] = await response.json();

        // Filter to only include allowed brands
        const filteredBrands = paintBrands.filter((brand) =>
          ALLOWED_PAINT_BRANDS.includes(brand.name)
        );

        setPaintBrands([
          SELECT_SELECT_PAINT_BRAND,
          UNDECIDED_SELECT_PAINT_BRAND,
          ...filteredBrands,
          CUSTOM_SELECT_PAINT_BRAND,
          OTHER_SELECT_PAINT_BRAND,
        ]);
      } catch (err) {
        console.error('Error fetching paint brands:', err);
      }
    };

    fetchPaintBrands();
  }, []);

  const handleColorSearch = async (
    name: TPreferencesColorKey,
    selectedBrand: string = selectedBrandRecord[name]
  ) => {
    const preferencesColorKey: TPreferencesColorKey = name;
    const limit = 20; // Max limit per request
  
    console.log('handleColorSearch');
  
    // Avoid search if selected brand is "Other Brand", "Custom Color", or "Undecided"
    if (selectedBrand === "Other Brand" || selectedBrand === "Custom Color" || selectedBrand === "Undecided") {
      console.log('Skipping color search for special brands:', selectedBrand);
      return;
    }
  
    if (!selectedBrand) {
      const error = 'Please select a brand';
      setSearchError(error);
      console.error(error);
      return;
    }
  
    console.log(name, selectedBrand, hexCode);
  
    let allColors: TColor[] = [];
    let offset = 0;
    let totalColors = 0;
  
    try {
      do {
        const url = `${COLOR_API_ROOT}/search?q=${selectedBrand}&offset=${offset}&limit=${limit}`;
  
        const searchResponse = await fetch(url, {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        });
  
        if (!searchResponse.ok) {
          throw new Error(`API call failed with status ${searchResponse.status}`);
        }
  
        const searchData = await searchResponse.json();
        totalColors = searchData.count;
  
        // Process and simplify color names
        const colorsBatch = searchData.result.colors.map((color: TColor) => {
          let { name } = color;
  
          // Step 1: Remove everything up to and including the first hyphen
          if (name.includes('-')) {
            name = name.substring(name.indexOf('-') + 1).trim();
          }
  
          // Step 2: Special case for "Sherwin-Williams": Remove "Williams - " if it remains
          name = name.replace(/^Williams\s*-\s*/, '');
  
          // Step 3: Remove leading numbers only if followed by letters
          name = name.replace(/^\d+\s+(?=[a-zA-Z])/, '');
  
          // Step 4: Remove any trailing codes after a slash or additional trailing numbers
          name = name.replace(/\s*\/.*|\s+\d+$/, '');
  
          // Step 5: Replace any leftover " -" with a clean space
          name = name.replace(/\s*-\s*/, '');
  
          console.log(`Original color name: ${color.name}, Simplified color name: ${name}`);
  
          return { ...color, name };
        });
  
        allColors = allColors.concat(colorsBatch);
        offset += limit; // Increment offset for the next batch
  
      } while (allColors.length < totalColors);
  
      console.log('Final color list after simplification:', allColors);
      setSelectedBrandMatchesRecord((prev) => ({
        ...prev,
        [name]: allColors,
      }));

      return;
      /*const potentialHexCode = searchData.color;

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
        */
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
