  // console.log(email, password, address, name);

  // useEffect(() => { // might be duplicate in preferences
  //   console.log('searchParams:', searchParams.toString());
  //   console.log('agentId:', agentId);
  //   console.log('userImageId:', userImageId);

  //   const initAutocomplete = async () => {
  //     try {
  //       await loadGoogleMapsScript(
  //         'AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA'
  //       ); // Replace with your actual API key
  //       if (window.google) {
  //         const autocomplete =
  //           new window.google.maps.places.Autocomplete(
  //             addressInputRef.current!,
  //             {
  //               types: ['address'],
  //               componentRestrictions: { country: 'us' },
  //             }
  //           );

  //         autocomplete.addListener('place_changed', () => {
  //           const place = autocomplete.getPlace();
  //           if (
  //             !place.geometry ||
  //             !place.geometry.location ||
  //             !place.address_components
  //           ) {
  //             console.error(
  //               'Error: place details are incomplete.'
  //             );
  //             return;
  //           }

  //           setAddress(place.formatted_address ?? ''); // Add a fallback value
  //           setAddressComponents(
  //             place.address_components ?? []
  //           );
  //           setErrorMessage(''); // Clear the error message when a valid address is selected
  //         });
  //       }
  //     } catch (error) {
  //       console.error(
  //         'Error loading Google Maps script:',
  //         error
  //       );
  //     }
  //   };

  //   initAutocomplete();
  // }, [agentId, userImageId, searchParams]);
  // console.log(email, password, address, name);

  // useEffect(() => { // might be duplicate in preferences
  //   console.log('searchParams:', searchParams.toString());
  //   console.log('agentId:', agentId);
  //   console.log('userImageId:', userImageId);

  //   const initAutocomplete = async () => {
  //     try {
  //       await loadGoogleMapsScript(
  //         'AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA'
  //       ); // Replace with your actual API key
  //       if (window.google) {
  //         const autocomplete =
  //           new window.google.maps.places.Autocomplete(
  //             addressInputRef.current!,
  //             {
  //               types: ['address'],
  //               componentRestrictions: { country: 'us' },
  //             }
  //           );

  //         autocomplete.addListener('place_changed', () => {
  //           const place = autocomplete.getPlace();
  //           if (
  //             !place.geometry ||
  //             !place.geometry.location ||
  //             !place.address_components
  //           ) {
  //             console.error(
  //               'Error: place details are incomplete.'
  //             );
  //             return;
  //           }

  //           setAddress(place.formatted_address ?? ''); // Add a fallback value
  //           setAddressComponents(
  //             place.address_components ?? []
  //           );
  //           setErrorMessage(''); // Clear the error message when a valid address is selected
  //         });
  //       }
  //     } catch (error) {
  //       console.error(
  //         'Error loading Google Maps script:',
  //         error
  //       );
  //     }
  //   };

  //   initAutocomplete();
  // }, [agentId, userImageId, searchParams]);
