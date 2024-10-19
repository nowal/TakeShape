export const EMPTY = 'empty';
// import React, {
//   useEffect,
//   useState,
//   Suspense,
// } from 'react';
// import { useAtom } from 'jotai';
// import {
//   useRouter,
//   useSearchParams,
// } from 'next/navigation';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import {
//   getFirestore,
//   doc,
//   setDoc,
//   getDoc,
//   updateDoc,
// } from 'firebase/firestore';
// import { defaultPreferencesAtom } from '@/atom';
// import { GoogleAnalytics } from '@next/third-parties/google';

// interface PaintBrand {
//   id: string;
//   name: string;
//   count: number;
// }

// interface Color {
//   id: string;
//   name: string;
//   brand: string;
// }

// const DefaultPreferences: React.FC = () => {
//   const firestore = getFirestore();
//   const auth = getAuth();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [authInitialized, setAuthInitialized] =
//     useState(false);
//   const [defaultPreferences, setDefaultPreferences] =
//     useAtom(defaultPreferencesAtom);
//   const [showCeilingFields, setShowCeilingFields] =
//     useState(defaultPreferences.ceilings || false);
//   const [showTrimFields, setShowTrimFields] = useState(
//     defaultPreferences.trim || false
//   );
//   const [laborAndMaterial, setLaborAndMaterial] =
//     useState<boolean>(true);
//   const [specialRequests, setSpecialRequests] =
//     useState<string>('');
//   const [moveFurniture, setMoveFurniture] =
//     useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPopup, setShowPopup] = useState(false);

//   const [paintBrands, setPaintBrands] = useState<
//     PaintBrand[]
//   >([]);
//   const [selectedBrand, setSelectedBrand] = useState<
//     string | null
//   >(null);
//   const [colorName, setColorName] = useState('');
//   const [hexCode, setHexCode] = useState<string | null>(
//     null
//   );
//   const [searchError, setSearchError] = useState('');

//   const userImageId =
//     searchParams.get('userImageId') ||
//     sessionStorage.getItem('userImageId');

//   const API_KEY =
//     's4DVRG5JuBZ9SMbTUTqWpQ12R3iF7UXGGrzvNWQSDxQJiMtYKuXFEwTVTCK4vsDjsror9pSXbZt538ePykASuijcaJaynz';

//   useEffect(() => {
//     const fetchPaintBrands = async () => {
//       try {
//         const response = await fetch(
//           `https://api.encycolorpedia.com/v1/paints`,
//           {
//             headers: {
//               Authorization: `Bearer ${API_KEY}`,
//             },
//           }
//         );
//         const data: PaintBrand[] = await response.json();
//         setPaintBrands(data);
//       } catch (err) {
//         console.error('Error fetching paint brands:', err);
//       }
//     };

//     fetchPaintBrands();
//   }, []);

//   useEffect(() => {
//     setDefaultPreferences({
//       color: '',
//       finish: 'Eggshell',
//       paintQuality: 'Medium',
//       ceilingColor: 'White',
//       ceilingFinish: 'Flat',
//       trimColor: 'White',
//       trimFinish: 'Semi-gloss',
//       ...defaultPreferences,
//     });
//   }, []);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setAuthInitialized(true);
//       } else {
//         setAuthInitialized(false);
//       }
//     });
//     return () => unsubscribe();
//   }, [auth]);

//   useEffect(() => {
//     if (authInitialized && auth.currentUser) {
//       fetchUserDefaultPreferences();
//     }
//   }, [authInitialized, auth.currentUser, firestore]);

//   const handleColorSearch = async () => {
//     if (!selectedBrand) {
//       setSearchError('Please select a brand');
//       return;
//     }

//     const searchQuery = `${selectedBrand} ${colorName}`;

//     try {
//       // 1. Initial search using /v1/search
//       const searchResponse = await fetch(
//         `https://api.encycolorpedia.com/v1/search?q=${searchQuery}`,
//         {
//           headers: {
//             Authorization: `Bearer ${API_KEY}`,
//           },
//         }
//       );

//       if (!searchResponse.ok) {
//         throw new Error(
//           `Initial search failed with status ${searchResponse.status}`
//         );
//       }

//       const searchData = await searchResponse.json();
//       console.log('Initial search result:', searchData);

//       const potentialHexCode = searchData.color;

//       // 2. Verification using /v1/paints (POST)
//       const matchResponse = await fetch(
//         `https://api.encycolorpedia.com/v1/paints`,
//         {
//           method: 'POST',
//           headers: {
//             Authorization: `Bearer ${API_KEY}`,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify([potentialHexCode]),
//         }
//       );

//       if (!matchResponse.ok) {
//         throw new Error(
//           `Match request failed with status ${matchResponse.status}`
//         );
//       }

//       const matchData = await matchResponse.json();
//       console.log('Match result:', matchData);

//       const isMatch = Object.values(
//         matchData as { [key: string]: Color[] }
//       ).some((colors: Color[]) =>
//         colors.some(
//           (color) =>
//             color.brand.toLowerCase() ===
//               selectedBrand.toLowerCase() &&
//             color.name
//               .toLowerCase()
//               .includes(colorName.toLowerCase())
//         )
//       );

//       if (isMatch) {
//         // Find the first matching color to get its full name
//         const matchingColor = Object.values(
//           matchData as { [key: string]: Color[] }
//         )
//           .flatMap((colors) => colors)
//           .find(
//             (color) =>
//               color.brand.toLowerCase() ===
//                 selectedBrand.toLowerCase() &&
//               color.name
//                 .toLowerCase()
//                 .includes(colorName.toLowerCase())
//           );

//         setHexCode(potentialHexCode);
//         setColorName(matchingColor?.name || '');
//         setSearchError(''); // Clear any previous search errors

//         // Update defaultPreferences with the found color name and hex code
//         setDefaultPreferences((prev) => ({
//           ...prev,
//           color: matchingColor?.name || '',
//         }));
//       } else {
//         setHexCode(null);
//         setSearchError('Color match not found');
//       }
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setSearchError('An error occurred during the search');
//     }
//   };

//   const fetchUserDefaultPreferences = async () => {
//     if (!auth.currentUser || !userImageId) return;

//     const userImageDocRef = doc(
//       firestore,
//       'userImages',
//       userImageId
//     );
//     const userImageDoc = await getDoc(userImageDocRef);
//     if (userImageDoc.exists()) {
//       const userImageDocData = userImageDoc.data();
//       setLaborAndMaterial(
//         userImageDocData.laborAndMaterial ?? true
//       ); // Default to labor and material if field is missing
//       setSpecialRequests(
//         userImageDocData.specialRequests || ''
//       ); // Load special requests if available
//       setMoveFurniture(
//         userImageDocData.moveFurniture ?? false
//       ); // Load moveFurniture if available
//       if (userImageDocData.paintPreferencesId) {
//         const paintPrefDocRef = doc(
//           firestore,
//           'paintPreferences',
//           userImageDocData.paintPreferencesId
//         );
//         const paintPrefDocSnap = await getDoc(
//           paintPrefDocRef
//         );
//         if (paintPrefDocSnap.exists()) {
//           setDefaultPreferences({
//             color: '',
//             finish: 'Eggshell',
//             paintQuality: 'Medium',
//             ceilingColor: 'White',
//             ceilingFinish: 'Flat',
//             trimColor: 'White',
//             trimFinish: 'Semi-gloss',
//             laborAndMaterial: laborAndMaterial,
//             ...paintPrefDocSnap.data(),
//           });
//           setShowCeilingFields(
//             paintPrefDocSnap.data().ceilings || false
//           );
//           setShowTrimFields(
//             paintPrefDocSnap.data().trim || false
//           );
//           setShowPopup(true); // Show the popup if paint preferences exist
//         }
//       }
//     } else {
//       setLaborAndMaterial(true); // Default to labor and material if no document found
//       setDefaultPreferences({
//         color: '',
//         finish: 'Eggshell',
//         paintQuality: 'Medium',
//         ceilingColor: 'White',
//         ceilingFinish: 'Flat',
//         trimColor: 'White',
//         trimFinish: 'Semi-gloss',
//         laborAndMaterial: laborAndMaterial,
//       });
//     }
//   };

//   const handlePreferenceSubmit = async (
//     navigateTo: string,
//     morePreferences: boolean
//   ) => {
//     if (!auth.currentUser || !userImageId) return;
//     setIsLoading(true); // Set loading state to true

//     const userImageDocRef = doc(
//       firestore,
//       'userImages',
//       userImageId
//     );
//     const paintPrefDocRef = doc(
//       firestore,
//       'paintPreferences',
//       `${userImageId}-${auth.currentUser.uid}`
//     );

//     // Build the updatedPreferences object conditionally
//     const updatedPreferences = {
//       laborAndMaterial: laborAndMaterial, // Add laborAndMaterial field
//       color:
//         (
//           document.getElementsByName(
//             'color'
//           )[0] as HTMLInputElement
//         )?.value || defaultPreferences.color,
//       finish:
//         (
//           document.getElementsByName(
//             'finish'
//           )[0] as HTMLSelectElement
//         )?.value || defaultPreferences.finish,
//       paintQuality:
//         (
//           document.getElementsByName(
//             'paintQuality'
//           )[0] as HTMLSelectElement
//         )?.value || defaultPreferences.paintQuality,
//       ceilings: showCeilingFields,
//       trim: showTrimFields,
//       ceilingColor:
//         (
//           document.getElementsByName(
//             'ceilingColor'
//           )[0] as HTMLInputElement
//         )?.value || defaultPreferences.ceilingColor,
//       ceilingFinish:
//         (
//           document.getElementsByName(
//             'ceilingFinish'
//           )[0] as HTMLSelectElement
//         )?.value || defaultPreferences.ceilingFinish,
//       trimColor:
//         (
//           document.getElementsByName(
//             'trimColor'
//           )[0] as HTMLInputElement
//         )?.value || defaultPreferences.trimColor,
//       trimFinish:
//         (
//           document.getElementsByName(
//             'trimFinish'
//           )[0] as HTMLSelectElement
//         )?.value || defaultPreferences.trimFinish,
//     };

//     setDefaultPreferences(updatedPreferences);

//     await setDoc(paintPrefDocRef, updatedPreferences, {
//       merge: true,
//     });

//     await updateDoc(userImageDocRef, {
//       paintPreferencesId: paintPrefDocRef.id,
//       morePreferences,
//       laborAndMaterial, // Update laborAndMaterial field
//       specialRequests, // Save special requests
//       moveFurniture, // Save moveFurniture
//     });

//     // Pass userImageId to the dashboard
//     router.push(`${navigateTo}?userImageId=${userImageId}`);
//     setIsLoading(false); // Reset loading state
//   };

//   const handleChange = (
//     e:
//       | React.ChangeEvent<HTMLInputElement>
//       | React.ChangeEvent<HTMLSelectElement>
//   ) => {
//     const target = e.target as HTMLInputElement;
//     const value: string | boolean =
//       target.type === 'checkbox'
//         ? target.checked
//         : target.value;
//     const name = target.name;

//     setDefaultPreferences((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     if (target.type === 'checkbox') {
//       if (name === 'ceilings') {
//         setShowCeilingFields(target.checked);
//       } else if (name === 'trim') {
//         setShowTrimFields(target.checked);
//       }
//     }
//   };

//   const handleLaborMaterialChange = (value: boolean) => {
//     setLaborAndMaterial(value);
//     setShowCeilingFields(
//       defaultPreferences.ceilings ?? showCeilingFields
//     );
//     setShowTrimFields(
//       defaultPreferences.trim ?? showTrimFields
//     );
//   };

//   return (
//     <div className="defaultPreferences flex flex-col justify-start items-center h-screen mb-32">
//       <GoogleAnalytics gaId="G-47EYLN83WE" />
//       <div className="form-container text-center mt-10 md:mt-20">
//         <h2 className="text-2xl font-bold mb-8">
//           Set Your Paint Preferences
//         </h2>
//         {showPopup && (
//           <div className="popup-message bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
//             <strong className="font-bold">Warning: </strong>
//             <span className="block sm:inline">
//               If you modify your paint preferences, then any
//               existing quotes will no longer be available.
//             </span>
//           </div>
//         )}
//         <div className="flex flex-col items-center gap-2 mb-6">
//           <p>
//             Do you want the painters to quote you for labor
//             only or labor and material?
//           </p>
//           <div className="flex gap-4">
//             <label className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={laborAndMaterial === false}
//                 onChange={() =>
//                   handleLaborMaterialChange(false)
//                 }
//                 className="form-checkbox"
//               />
//               Labor Only
//             </label>
//             <label className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={laborAndMaterial === true}
//                 onChange={() =>
//                   handleLaborMaterialChange(true)
//                 }
//                 className="form-checkbox"
//               />
//               Labor and Material
//             </label>
//           </div>
//         </div>

//         {laborAndMaterial && (
//           <div className="preferences-row flex flex-col items-center gap-2 mb-6">
//             <div className="extra-fields-row flex justify-between w-full">
//               <label className="text-left">
//                 Wall Color
//                 <div className="flex">
//                   {' '}
//                   {/* Container for brand dropdown and color input */}
//                   <select
//                     value={selectedBrand || ''}
//                     onChange={(e) =>
//                       setSelectedBrand(e.target.value)
//                     }
//                     className="input-field select-field mr-2" // Add margin-right for spacing
//                   >
//                     <option value="">Select a brand</option>
//                     {paintBrands.map((brand) => (
//                       <option
//                         key={brand.id}
//                         value={brand.id}
//                       >
//                         {brand.name}
//                       </option>
//                     ))}
//                   </select>
//                   <input
//                     type="text"
//                     name="color"
//                     placeholder="E.g. white"
//                     value={colorName}
//                     onChange={(e) =>
//                       setColorName(e.target.value)
//                     }
//                     className="input-field"
//                   />
//                   <button
//                     onClick={handleColorSearch}
//                     className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//                   >
//                     Search
//                   </button>
//                 </div>
//                 {searchError && (
//                   <p style={{ color: 'red' }}>
//                     {searchError}
//                   </p>
//                 )}
//                 <div className="tooltip-container">
//                   <span className="help-link text-sm">
//                     Undecided?
//                   </span>
//                   <span className="tooltiptext">
//                     Type "Undecided" in the color field and
//                     the painter you choose can help you with
//                     choosing a color.
//                   </span>
//                 </div>
//                 {hexCode && ( // Display color square if hexCode is available
//                   <div
//                     className="color-square mt-2"
//                     style={{
//                       backgroundColor: '#' + hexCode,
//                       width: '50px',
//                       height: '50px',
//                     }}
//                   />
//                 )}
//               </label>
//               <label className="text-left">
//                 Wall Finish
//                 <select
//                   name="finish"
//                   value={defaultPreferences.finish || ''}
//                   onChange={handleChange}
//                   className="input-field select-field"
//                 >
//                   <option value="Eggshell">Eggshell</option>
//                   <option value="Flat">Flat</option>
//                   <option value="Satin">Satin</option>
//                   <option value="Semi-gloss">
//                     Semi-Gloss
//                   </option>
//                   <option value="High-gloss">
//                     High Gloss
//                   </option>
//                 </select>
//               </label>
//               <span className="tooltip">
//                 ?
//                 <span className="tooltiptext">
//                   We default to eggshell finish because of
//                   its versatility, but you are welcome to
//                   pick whatever finish you prefer
//                 </span>
//               </span>
//             </div>
//             <label className="text-left">
//               Paint Quality
//               <select
//                 name="paintQuality"
//                 value={
//                   defaultPreferences.paintQuality || ''
//                 }
//                 onChange={handleChange}
//                 className="input-field select-field"
//               >
//                 <option value="Medium">
//                   Medium Quality
//                 </option>
//                 <option value="Budget">
//                   Budget Quality
//                 </option>
//                 <option value="High">High Quality</option>
//               </select>
//             </label>
//           </div>
//         )}
//         <label className="flex items-center gap-2 mb-2">
//           <input
//             type="checkbox"
//             name="ceilings"
//             checked={defaultPreferences.ceilings || false}
//             onChange={handleChange}
//           />
//           Do you want your ceilings painted?
//         </label>
//         {showCeilingFields && laborAndMaterial && (
//           <div className="extra-fields-row flex justify-between w-full">
//             <label className="text-left">
//               Ceiling Color
//               <input
//                 type="text"
//                 name="ceilingColor"
//                 placeholder="Ceiling Color"
//                 value={
//                   defaultPreferences.ceilingColor || 'White'
//                 }
//                 onChange={handleChange}
//                 className="input-field"
//               />
//             </label>
//             <label className="text-left">
//               Ceiling Finish
//               <select
//                 name="ceilingFinish"
//                 value={
//                   defaultPreferences.ceilingFinish || ''
//                 }
//                 onChange={handleChange}
//                 className="input-field select-field"
//               >
//                 <option value="Flat">Flat</option>
//                 <option value="Eggshell">Eggshell</option>
//                 <option value="Satin">Satin</option>
//                 <option value="Semi-gloss">
//                   Semi-Gloss
//                 </option>
//                 <option value="High-gloss">
//                   High Gloss
//                 </option>
//               </select>
//             </label>
//             <span className="tooltip">
//               ?
//               <span className="tooltiptext">
//                 This color and finish are the most standard
//                 for ceilings, but you are welcome to pick
//                 your own.
//               </span>
//             </span>
//           </div>
//         )}
//         <label className="flex items-center gap-2 mt-2 mb-2">
//           <input
//             type="checkbox"
//             name="trim"
//             checked={defaultPreferences.trim || false}
//             onChange={handleChange}
//           />
//           Do you want your trim and doors painted?
//         </label>
//         {showTrimFields && laborAndMaterial && (
//           <div className="extra-fields-row flex justify-between w-full">
//             <label className="text-left">
//               Trim Color
//               <input
//                 type="text"
//                 name="trimColor"
//                 placeholder="Trim Color"
//                 value={
//                   defaultPreferences.trimColor || 'White'
//                 }
//                 onChange={handleChange}
//                 className="input-field"
//               />
//             </label>
//             <label className="text-left">
//               Trim Finish
//               <select
//                 name="trimFinish"
//                 value={defaultPreferences.trimFinish || ''}
//                 onChange={handleChange}
//                 className="input-field select-field"
//               >
//                 <option value="Semi-gloss">
//                   Semi-Gloss
//                 </option>
//                 <option value="Flat">Flat</option>
//                 <option value="Eggshell">Eggshell</option>
//                 <option value="Satin">Satin</option>
//                 <option value="High-gloss">
//                   High Gloss
//                 </option>
//               </select>
//             </label>
//             <span className="tooltip">
//               ?
//               <span className="tooltiptext">
//                 This color and finish are the most standard
//                 for trim, but you are welcome to pick your
//                 own.
//               </span>
//             </span>
//           </div>
//         )}
//         <label className="flex items-center gap-2 mb-4 mt-2">
//           <input
//             type="checkbox"
//             name="moveFurniture"
//             checked={moveFurniture}
//             onChange={(e) =>
//               setMoveFurniture(e.target.checked)
//             }
//             className="form-checkbox"
//           />
//           Will the painters need to move any furniture?
//         </label>
//         <label className="text-left">
//           Special Requests:
//           <textarea
//             name="specialRequests"
//             placeholder="E.g. Don't paint ceilings in bedrooms, don't remove nails in the wall"
//             value={specialRequests}
//             onChange={(e) =>
//               setSpecialRequests(e.target.value)
//             }
//             rows={3}
//             className="input-field"
//           />
//         </label>
//         <div className="preferences-buttons flex justify-center gap-4 my-4">
//           <button
//             onClick={() => router.push('/quote')}
//             className="resubmit-btn button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300"
//           >
//             Resubmit Video
//           </button>
//           <button
//             onClick={() =>
//               handlePreferenceSubmit('/dashboard', false)
//             }
//             className={`only-preferences-btn button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300 ${
//               isLoading
//                 ? 'opacity-50 cursor-not-allowed'
//                 : ''
//             }`}
//             disabled={isLoading}
//           >
//             {isLoading
//               ? 'Submitting...'
//               : 'Submit Preferences'}
//           </button>
//         </div>
//       </div>
//       <style jsx>{`
//         .disabled-btn {
//           background-color: grey;
//         }
//         .defaultPreferences {
//           display: flex;
//           flex-direction: column;
//           justify-content: flex-start;
//           align-items: center;
//           height: 120vh;
//         }
//         .form-container {
//           width: 100%;
//           max-width: 500px;
//           padding: 2rem;
//           box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//           border-radius: 8px;
//           margin-top: 5vh;
//         }
//         .input-field,
//         .select-field {
//           width: 100%;
//           padding: 0.5rem;
//           margin-bottom: 0.5rem;
//           border: 1px solid #ccc;
//           border-radius: 4px;
//         }
//         .preferences-row {
//           flex-direction: column;
//           gap: 1rem;
//         }
//         .button-group {
//           display: flex;
//           gap: 1rem;
//         }
//         .resubmit-btn,
//         .submit-btn {
//           padding: 0.75rem;
//           font-size: 1rem;
//         }
//         .tooltip {
//           position: relative;
//           display: inline-block;
//           border-bottom: 1px dotted black;
//         }
//         .tooltip .tooltiptext {
//           visibility: hidden;
//           width: 120px;
//           background-color: black;
//           color: #fff;
//           text-align: center;
//           border-radius: 6px;
//           padding: 5px 0;
//           position: absolute;
//           z-index: 1;
//           bottom: 100%;
//           left: 50%;
//           margin-left: -60px;
//         }
//         .tooltip:hover .tooltiptext {
//           visibility: visible;
//         }
//         .help-link {
//           color: blue;
//           text-decoration: underline;
//           cursor: pointer;
//         }
//         .tooltip-container {
//           position: relative;
//           display: inline-block;
//         }
//         .tooltip-container .tooltiptext {
//           visibility: hidden;
//           width: 200px;
//           background-color: black;
//           color: #fff;
//           text-align: center;
//           border-radius: 6px;
//           padding: 5px 0;
//           position: absolute;
//           z-index: 1;
//           bottom: 125%;
//           left: 50%;
//           margin-left: -100px;
//           opacity: 0;
//           transition: opacity 0.3s;
//         }
//         .tooltip-container:hover .tooltiptext {
//           visibility: visible;
//           opacity: 1;
//         }
//         .note-text {
//           text-align: center;
//           color: #666;
//           font-size: 0.875rem;
//           max-width: 90%;
//           margin: 20px auto;
//         }
//       `}</style>
//     </div>
//   );
// };

// const DefaultPreferencesWithSuspense: React.FC = () => (
//   <Suspense fallback={<div>Loading...</div>}>
//     <DefaultPreferences />
//   </Suspense>
// );

// export default DefaultPreferencesWithSuspense;
