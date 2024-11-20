import type { FC } from "react";
import { useState, useEffect } from "react";
import { InputsText } from "@/components/inputs/text";
import { usePreferences } from "@/context/preferences/provider";
import { TPreferencesColorKey } from "@/atom/types";
import { TInputProps } from "@/types/dom/element";
import { InputsSelect } from "@/components/inputs/select";
import { INPUTS_NAME_DELIMITER } from "@/constants/inputs";
import { usePreferencesStateColor } from "@/hooks/color";
import { CvaButton } from "@/components/cva/button";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";

const PREFERENCES_INPUTS_COLOR_BRAND_NAME = "color-brand";

type TProps = Omit<TInputProps, "name" | "value"> & {
  name: TPreferencesColorKey;
  value?: string;
};

export const PreferencesInputsColorBrand: FC<TProps> = ({
  name,
  ...props
}) => {
  const preferences = usePreferences();
  const { onColorValueChange } = preferences;

  const {
    selectedBrandRecord,
    onSelectBrandValueChange,
    paintBrands,
    isLoadingBrands = true,
    onSearchColors,
    isLoadingColors = true,
    foundColors,
  } = usePreferencesStateColor();

  const value = selectedBrandRecord[name];

  const [colorSearchTerm, setColorSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialBrand, setInitialBrand] = useState<string | undefined>(
    undefined
  );
  const [initialColor, setInitialColor] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchInitialValues = async () => {
      const auth = getAuth();
      const firestore = getFirestore();
      const userId = auth.currentUser?.uid;

      if (userId) {
        try {
          const userImagesRef = collection(firestore, "userImages");
          const q = query(userImagesRef, where("userId", "==", userId));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userImageDoc = querySnapshot.docs[0];
            const paintPreferencesId = userImageDoc.data().paintPreferencesId;

            if (paintPreferencesId) {
              const paintPrefDocRef = doc(
                firestore,
                "paintPreferences",
                paintPreferencesId
              );
              const paintPrefDoc = await getDoc(paintPrefDocRef);

              if (paintPrefDoc.exists()) {
                const paintPrefData = paintPrefDoc.data();
                setInitialBrand(paintPrefData.brand);
                setInitialColor(paintPrefData.color);
              } else {
                console.error("Paint preferences document not found.");
              }
            } else {
              console.error(
                "paintPreferencesId not found in userImages document"
              );
            }
          } else {
            console.error("No userImage document found with the given userId");
          }
        } catch (error) {
          console.error("Error fetching initial values:", error);
        }
      }
    };

    fetchInitialValues();
  }, []);

  useEffect(() => {
    if (foundColors.length > 0) {
      setShowDropdown(true);
    }
  }, [foundColors]);

  const handleColorSelect = (color: { name: string; id: string }) => {
    onColorValueChange(name, color.name, value);
    setColorSearchTerm(color.name);
    setInitialColor(color.name);
    setShowDropdown(false);
  };

  const handleBrandChange = (namePath: string, newValue: string) => {
    setInitialBrand(newValue);
    onSelectBrandValueChange(namePath, newValue);
    setInitialColor(undefined); // Clear the initial color
    setColorSearchTerm(""); // Clear the color search term
    setHasSearched(false); // Reset the search state
  };

  const handleSearch = async () => {
    setHasSearched(true);
  
    // Use initialBrand if available, otherwise fall back to value
    const brandToSearch = initialBrand || value; 
  
    await onSearchColors(name, brandToSearch, colorSearchTerm);
    setShowDropdown(true);
  };

  return (
    <div className="flex flex-row justify-end grow gap-4">
      {isLoadingBrands ? (
        <div className="text-gray-500 italic">Loading Brands...</div>
      ) : (
        <InputsSelect
          placeholder="Select Brand"
          name={`${PREFERENCES_INPUTS_COLOR_BRAND_NAME}${INPUTS_NAME_DELIMITER}${name}`}
          value={initialBrand} // Use initialBrand directly
          onValueChange={(namePath, newValue) => {
            handleBrandChange(namePath, newValue);
          }}
          idValues={paintBrands}
        />
      )}

      {value === "Undecided" ? (
        <div className="text-gray-600 italic">Decide with Painter Later</div>
      ) : value === "Other Brand" || value === "Custom Color" ? (
        <InputsText
          name={name}
          placeholder={
            value === "Other Brand"
              ? "Other Brand and Color"
              : "Explain Custom Color"
          }
          value={initialColor || ""}
          onChange={(event) => {
            const colorValue = event.target.value;
            setInitialColor(colorValue); // Update initialColor
            onColorValueChange(name, colorValue, value);
          }}
        />
      ) : (
        // Always show InputsText
        <div className="relative flex items-center">
          <div className="w-3/5">
            <InputsText
              name={name}
              placeholder={props.value ?? "Type to search colors..."}
              value={initialColor || colorSearchTerm}
              onChange={(e) => {
                setColorSearchTerm(e.target.value);
                setInitialColor(e.target.value); // Update initialColor
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                setTimeout(() => setShowDropdown(false), 200);
              }}
            />
          </div>
          <div className="ml-4">
            <CvaButton title="Search" onTap={handleSearch}>
              Search
            </CvaButton>
          </div>
          {showDropdown && (
            <ul
              className="absolute bg-white border border-gray-300 w-full max-h-60 overflow-auto z-10"
              style={{
                top: "calc(100% + 0.25rem)",
                left: 0,
                transform: "translateY(0.25rem)",
              }}
            >
              {foundColors.length > 0 ? (
                <>
                  <li className="px-4 py-2 text-gray-600 cursor-default">
                    Select Color Below
                  </li>
                  {foundColors.map((color) => (
                    <li
                      key={color.id}
                      className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer"
                      onMouseDown={() => handleColorSelect(color)}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: `#${color.id}` }}
                      />
                      <span>{color.name}</span>
                    </li>
                  ))}
                </>
              ) : (
                hasSearched && (
                  <li className="px-4 py-2 text-gray-600 cursor-default">
                    Color Not Found
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};