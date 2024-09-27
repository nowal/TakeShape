  /*const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
  
      setUploading(true);
      const fileRef = storageRef(storage, `uploads/${file.name}`);
  
      try {
        await uploadBytes(fileRef, file);
        console.log('Uploaded to Firebase:', file.name);
        const fileUrl = await getDownloadURL(fileRef);
        onUploadSuccess(fileUrl);
        console.log('Hello3');
        console.log('File URL:', fileUrl);
        // You can now use fileUrl for further actions, e.g., save to state, display the image, etc.
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setUploading(false);
      }
    };*/