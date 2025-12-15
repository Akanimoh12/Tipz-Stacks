import { useState, useRef, useEffect } from 'react';
import { FiUpload, FiX, FiPlus, FiTrash2, FiAlertCircle, FiCheck, FiInfo } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '../../hooks/useRegistration';
import { useWallet } from '../../hooks/useWallet';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import RegistrationSteps from './RegistrationSteps';

const CATEGORIES = [
  'Artist',
  'Musician',
  'Writer',
  'Developer',
  'Designer',
  'Content Creator',
  'Educator',
  'Photographer',
  'Podcaster',
  'Other'
];

export default function CreatorRegistrationForm() {
  const navigate = useNavigate();
  const { walletAddress } = useWallet();
  const {
    currentStep,
    formData,
    isUploading,
    uploadProgress,
    isRegistering,
    error,
    updateFormField,
    updateSocialLink,
    addPortfolioLink,
    updatePortfolioLink,
    removePortfolioLink,
    handleImageSelect,
    validateStep,
    nextStep,
    prevStep,
    submitRegistration,
    // Real-time validation
    isCheckingName,
    nameAvailable,
    alreadyRegistered,
    checkAddressRegistration,
    debouncedNameCheck,
  } = useRegistration();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [nameError, setNameError] = useState<string | null>(null);

  // Check if user is already registered on mount
  useEffect(() => {
    if (walletAddress) {
      checkAddressRegistration(walletAddress);
    }
  }, [walletAddress, checkAddressRegistration]);

  // Handle image selection
  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    handleImageSelect(file);
  };

  // Handle step navigation with validation
  const handleNext = () => {
    const validation = validateStep(currentStep);
    if (!validation.valid) {
      setValidationErrors({ general: validation.error || 'Validation failed' });
      return;
    }
    setValidationErrors({});
    nextStep();
  };

  const handlePrev = () => {
    setValidationErrors({});
    prevStep();
  };

  // Handle final submission
  const handleSubmit = async () => {
    const validation = validateStep(4);
    if (!validation.valid) {
      setValidationErrors({ general: validation.error || 'Validation failed' });
      return;
    }
    setValidationErrors({});
    await submitRegistration();
  };

  // Handle name change with real-time validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateFormField('name', value);
    
    // Clear previous errors
    setNameError(null);
    
    // Validate length
    if (value.length > 0 && value.length < 3) {
      setNameError('Name must be at least 3 characters');
      return;
    }
    
    if (value.length > 50) {
      setNameError('Name must be less than 50 characters');
      return;
    }
    
    // Check availability after debounce (only if name is valid length)
    if (value.length >= 3) {
      debouncedNameCheck(value);
    }
  };

  // Render Step 1: Basic Info
  const renderBasicInfo = () => (
    <div className="space-y-6">
      {/* Already Registered Warning */}
      {alreadyRegistered && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start">
            <FiInfo className="text-blue-500 mr-3 mt-0.5 shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-blue-800 font-medium">Already Registered</p>
              <p className="text-blue-700 text-sm mt-1">
                You have already registered as a creator.
              </p>
              <button 
                onClick={() => navigate(`/creator/${walletAddress}`)}
                className="text-blue-600 underline text-sm mt-2 hover:text-blue-800"
              >
                View your profile →
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Creator Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="Enter your creator name"
            maxLength={50}
            disabled={alreadyRegistered}
            className={`w-full px-4 py-3 pr-12 border ${
              nameError ? 'border-red-500' : 
              nameAvailable === true ? 'border-green-500' :
              nameAvailable === false ? 'border-red-500' :
              'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
          
          {/* Loading indicator */}
          {isCheckingName && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full" />
            </div>
          )}
          
          {/* Success indicator */}
          {!isCheckingName && nameAvailable === true && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
              <FiCheck size={20} />
            </div>
          )}
          
          {/* Error indicator */}
          {!isCheckingName && nameAvailable === false && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
              <FiX size={20} />
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-1">
          <div className="flex-1">
            {nameError && (
              <span className="text-sm text-red-500 flex items-center gap-1">
                <FiAlertCircle size={14} />
                {nameError}
              </span>
            )}
            {!nameError && nameAvailable === false && (
              <span className="text-sm text-red-500 flex items-center gap-1">
                <FiAlertCircle size={14} />
                This name is already taken. Please choose another.
              </span>
            )}
            {!nameError && nameAvailable === true && (
              <span className="text-sm text-green-500 flex items-center gap-1">
                <FiCheck size={14} />
                Name is available!
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500 ml-auto">
            {formData.name.length}/50
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => updateFormField('bio', e.target.value)}
          placeholder="Tell us about yourself and what you create..."
          maxLength={500}
          rows={5}
          className={`w-full px-4 py-3 border ${
            validationErrors.bio ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none`}
        />
        <div className="flex justify-between mt-1">
          {validationErrors.bio && (
            <span className="text-sm text-red-500 flex items-center gap-1">
              <FiAlertCircle size={14} />
              {validationErrors.bio}
            </span>
          )}
          <span className="text-sm text-gray-500 ml-auto">
            {formData.bio.length}/500
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categories (Select up to 3)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                const newCategories = formData.categories.includes(category)
                  ? formData.categories.filter((c) => c !== category)
                  : formData.categories.length < 3
                  ? [...formData.categories, category]
                  : formData.categories;
                updateFormField('categories', newCategories);
              }}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                formData.categories.includes(category)
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Step 2: Profile Image
  const renderProfileImage = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Image <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Upload a square image (JPG, PNG, or WebP). Max size: 5MB
        </p>

        {!imagePreview ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer group"
          >
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <FiUpload size={32} className="text-orange-500" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700">Click to upload</p>
              <p className="text-sm text-gray-500">or drag and drop</p>
            </div>
          </button>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                updateFormField('profileImage', null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onImageChange}
          className="hidden"
        />

        {validationErrors.profileImage && (
          <span className="text-sm text-red-500 flex items-center gap-1 mt-2">
            <FiAlertCircle size={14} />
            {validationErrors.profileImage}
          </span>
        )}
      </div>

      {imagePreview && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Tip:</strong> Make sure your image is clear and represents you well. This will be visible on your creator profile.
          </p>
        </div>
      )}
    </div>
  );

  // Render Step 3: Social Links & Portfolio
  const renderSocialLinks = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Social Links</h3>
        <div className="space-y-4">
          {(['twitter', 'instagram', 'youtube', 'website'] as const).map((platform) => (
            <div key={platform}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {platform}
              </label>
              <input
                type="url"
                value={formData.social[platform] || ''}
                onChange={(e) => updateSocialLink(platform, e.target.value)}
                placeholder={`https://${platform === 'website' ? 'example.com' : platform + '.com/username'}`}
                className={`w-full px-4 py-3 border ${
                  validationErrors[`social.${platform}`] ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
              />
              {validationErrors[`social.${platform}`] && (
                <span className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <FiAlertCircle size={14} />
                  {validationErrors[`social.${platform}`]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Portfolio Links</h3>
          <Button
            variant="secondary"
            size="small"
            onClick={addPortfolioLink}
            disabled={formData.portfolio.length >= 5}
          >
            <FiPlus size={16} />
            <span>Add Link</span>
          </Button>
        </div>

        {formData.portfolio.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No portfolio links added yet</p>
            <p className="text-sm">Add links to showcase your work</p>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.portfolio.map((link, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={link.title}
                  onChange={(e) => updatePortfolioLink(index, 'title', e.target.value)}
                  placeholder="Project title"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updatePortfolioLink(index, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removePortfolioLink(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-500 mt-2">
          Add up to 5 portfolio links (optional)
        </p>
      </div>
    </div>
  );

  // Render Step 4: Review & Submit
  const renderReview = () => (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <button
            onClick={() => prevStep()}
            className="text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            Edit
          </button>
        </div>
        <div className="space-y-2">
          <div>
            <span className="text-sm text-gray-500">Name:</span>
            <p className="font-medium">{formData.name}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Bio:</span>
            <p className="text-gray-700">{formData.bio}</p>
          </div>
          {formData.categories.length > 0 && (
            <div>
              <span className="text-sm text-gray-500">Categories:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.categories.map((cat) => (
                  <span key={cat} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Profile Image</h3>
        </div>
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Profile"
            className="w-32 h-32 object-cover rounded-lg"
          />
        )}
      </Card>

      <Card>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Social Links & Portfolio</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(formData.social).map(([platform, url]) =>
            url ? (
              <div key={platform}>
                <span className="text-sm text-gray-500 capitalize">{platform}:</span>
                <p className="text-blue-600 truncate">{url}</p>
              </div>
            ) : null
          )}
          {formData.portfolio.length > 0 && (
            <div>
              <span className="text-sm text-gray-500">Portfolio:</span>
              <ul className="mt-1 space-y-1">
                {formData.portfolio.map((link, idx) => (
                  <li key={idx} className="text-sm">
                    <span className="font-medium">{link.title}</span> - {link.url}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <FiAlertCircle size={16} />
            {error}
          </p>
        </div>
      )}

      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-700">
              Uploading to IPFS...
            </p>
            <span className="text-sm text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <RegistrationSteps currentStep={currentStep} />

      <Card className="mt-8">
        {currentStep === 1 && renderBasicInfo()}
        {currentStep === 2 && renderProfileImage()}
        {currentStep === 3 && renderSocialLinks()}
        {currentStep === 4 && renderReview()}

        <div className="flex gap-3 mt-8 pt-6 border-t">
          {currentStep > 1 && (
            <Button
              variant="secondary"
              onClick={handlePrev}
              disabled={isUploading || isRegistering}
              className="flex-1"
            >
              Back
            </Button>
          )}

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={
                isUploading || 
                isRegistering || 
                alreadyRegistered ||
                (currentStep === 1 && (!formData.name || nameAvailable !== true || !formData.bio))
              }
              className="flex-1"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={
                isUploading || 
                isRegistering || 
                alreadyRegistered || 
                !formData.name || 
                nameAvailable !== true ||
                !formData.bio ||
                !formData.profileImage
              }
              loading={isUploading || isRegistering}
              className="flex-1"
            >
              {isRegistering ? 'Registering...' : 'Complete Registration'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
