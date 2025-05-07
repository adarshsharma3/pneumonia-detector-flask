import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Reset states
    setPrediction('');
    setError('');
    setFile(selectedFile);
    
    // Create preview URL
    const filePreview = URL.createObjectURL(selectedFile);
    setPreview(filePreview);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a lung image to analyze');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    
    setLoading(true);
    setError('');
    
    fetch('http://localhost:5000/predict', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Server error occurred');
        }
        return response.json();
      })
      .then(data => {
        setPrediction(data.prediction);
      })
      .catch(err => {
        console.error(err);
        setError('Error analyzing the image. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    setPrediction('');
    setError('');
    if (preview) URL.revokeObjectURL(preview);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Federated X GLLE</h1>
          <div className="h-1 w-32 bg-blue-600 mx-auto my-3 rounded-full"></div>
          <h2 className="text-lg font-medium text-gray-600">Lung Image Analysis</h2>
        </header>

        <div className="space-y-6">
          {/* Upload area */}
          <div 
            className="border-2 border-dashed rounded-lg p-8 transition-colors flex flex-col items-center justify-center relative
              border-blue-300 hover:border-blue-500 bg-blue-50 min-h-52"
          >
            {!preview ? (
              <div className="py-6 flex flex-col items-center">
                <Upload className="w-12 h-12 text-blue-500 mb-2" />
                <p className="text-sm text-gray-600 text-center">
                  Drag & drop or click to upload a lung image
                </p>
              </div>
            ) : (
              <div className="relative w-full">
                <button 
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-100"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
                <img 
                  src={preview} 
                  alt="Lung scan preview" 
                  className="rounded-lg mx-auto max-h-64 object-contain w-full" 
                />
                <p className="text-xs text-gray-500 text-center mt-2 truncate">{file?.name}</p>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-red-700">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !file}
            className={`w-full rounded-lg py-3 px-4 font-medium flex items-center justify-center
              ${loading || !file 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all'}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Image'
            )}
          </button>
        </div>

        {/* Results section */}
        {prediction && !loading && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-medium text-green-800">Analysis Result</h3>
            </div>
            <p className="text-lg font-medium text-green-700">{prediction}</p>
          </div>
        )}

        <footer className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          Federated X GLLE - Minor 2 Project
        </footer>
      </div>
    </div>
  );
};

export default ImageUpload;