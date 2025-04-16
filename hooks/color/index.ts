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
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [isLoadingColors, setIsLoadingColors] = useState(true);

  const [foundColors, setFoundColors] = useState<TColor[]>([]);

  const [hexCode, setHexCode] = useState<string | null>(
    null
  );
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    const fetchPaintBrands = async () => {
      setIsLoadingBrands(true); // Ensure loading state is reset
      try {
        const response = await fetch(COLOR_PAINTS_API_ROOT, {
          headers: { Authorization: `Bearer ${API_KEY}` },
        });
        const paintBrands: TPaintBrand[] = await response.json();
  
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
      } finally {
        setIsLoadingBrands(false); // Ensure it turns off
      }
    };
  
    fetchPaintBrands();
  }, []);

  useEffect(() => {
    // Reset derived states when brand or other dependent state changes
    setSelectedBrandMatchesRecord(PREFERENCES_COLOR_BRAND_MATCHES_RECORD);
    setHexCode(null);
  }, [paintBrands]);
  
  

  const handleColorSearch = async (
    name: TPreferencesColorKey,
    selectedBrand: string = selectedBrandRecord[name]
  ) => {
    const preferencesColorKey: TPreferencesColorKey = name;
    const limit = 20; // Max limit per request
  
    console.log('handleColorSearch');
    console.log(isLoadingColors);
    setIsLoadingColors(true);
  
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

          console.log(url);

  
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

      console.log("This happening too soon?");

      setIsLoadingColors(false);

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

  const onSearchColors = async (
    name: TPreferencesColorKey,
    brand: string, 
    searchTerm: string
  ) => {
    try {
      setIsLoadingColors(true); 
      console.log(brand);

      const brandSlug = brand; // Convert brand to slug
      console.log(brandSlug);
      console.log(brandSlug, searchTerm);
      const url = `${COLOR_API_ROOT}/search?q=${searchTerm}&brand=${brandSlug}`;

      console.log(url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API call failed with status ${response.status}`);
      }

      const data = await response.json();
      const colors = data.result.colors; 

      console.log(colors);

      // Process and simplify color names (you can reuse your existing logic here)
      const processedColors: TColor[] = colors.map((color: any) => ({
        name: color.name,  // Map the 'name' property
        id: color.hex,     // Map the 'hex' property to 'id'
        brand: "",          // Add an empty string for the 'brand' property
      }));

      setFoundColors(processedColors); 
    } catch (error) {
      console.error('Error searching colors:', error);
      // Handle the error, maybe show a message to the user
    } finally {
      setIsLoadingColors(false);
    }
  };

  const handleSelectBrandValueChange = (namePath: string, value: string) => {
    const [_, name] = namePath.split(INPUTS_NAME_DELIMITER);
    console.log(value, name);
    
    if (isPreferencesColorKey(name)) {
      // Reset color loading state when a new brand is selected
      //setIsLoadingColors(false); // Ensure the state resets before a new fetch
      dispatchPreferences((prev: TPaintPreferences) => ({
        ...prev,
        [name]: undefined,
      }));
      setSelectedBrandRecord((prev) => ({
        ...prev,
        [name]: value,
      }));
  
      // Trigger new color search if applicable
      //handleColorSearch(name, value);
      setIsLoadingColors(false);
    }
  };

  const returnValue = {
    paintBrands,
    searchError,
    hexCode,
    selectedBrandRecord,
    selectedBrandMatchesRecord,
    isLoadingBrands,
    isLoadingColors,
    onSearchColors, // Add the new function
    foundColors,    // Add the new state
    onSelectBrandValueChange: handleSelectBrandValueChange,
    dispatchSelectedBrand: setSelectedBrandRecord,
  };
  
  console.log("usePreferencesStateColor return values:", returnValue);

  return returnValue;
};
