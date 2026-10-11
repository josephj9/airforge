const generateWebsite = async (blob) => {
  const formData = new FormData();

  formData.append('sketch', blob, 'sketch.png');

  try {
    const response = await fetch(
      'http://127.0.0.1:8000/api/generate',
      { method: 'POST', body: formData },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.detail || 'Could not generate website.');
    }
    return data;
  } catch (error) {
    console.error(
      'Error generating website:',
      error.message,
    );

    throw error;
  }
};



export default generateWebsite; 
