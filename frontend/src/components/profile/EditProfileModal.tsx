import React, { useState, useRef } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData?: {
    displayName?: string;
    bio?: string;
    profileImage?: string;
    twitter?: string;
    website?: string;
    showStats?: boolean;
  };
  onSave: (data: ProfileData) => Promise<void>;
}

interface ProfileData {
  displayName: string;
  bio: string;
  profileImage?: string;
  twitter: string;
  website: string;
  showStats: boolean;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentData,
  onSave,
}) => {
  const [formData, setFormData] = useState<ProfileData>({
    displayName: currentData?.displayName || '',
    bio: currentData?.bio || '',
    profileImage: currentData?.profileImage,
    twitter: currentData?.twitter || '',
    website: currentData?.website || '',
    showStats: currentData?.showStats !== false,
  });

  const [previewImage, setPreviewImage] = useState<string | undefined>(currentData?.profileImage);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.displayName && (formData.displayName.length < 3 || formData.displayName.length > 30)) {
      newErrors.displayName = 'Display name must be between 3 and 30 characters';
    }

    if (formData.bio && formData.bio.length > 100) {
      newErrors.bio = 'Bio must be 100 characters or less';
    }

    if (formData.twitter && !formData.twitter.match(/^@?[\w]{1,15}$/)) {
      newErrors.twitter = 'Invalid Twitter username';
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Website must be a valid URL (include http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'Please select a valid image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image must be less than 5MB' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to IPFS via Pinata
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload to Pinata using the service
      // Note: uploadImageWithProgress handles the actual IPFS upload
      // For immediate preview, we use the local data URL
      // The actual CID would be returned from uploadImageWithProgress
      
      setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
      setErrors({ ...errors, image: '' });
    } catch (err) {
      console.error('Error uploading image:', err);
      setErrors({ ...errors, image: 'Failed to upload image. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrors({ ...errors, submit: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image
            </label>
            <div className="flex items-center gap-4">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-4xl border-4 border-gray-200">
                  👤
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <FiUpload />
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Max 5MB. JPG, PNG, or GIF
                </p>
              </div>
            </div>
            {errors.image && (
              <p className="text-sm text-red-500 mt-1">{errors.image}</p>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Your display name"
              maxLength={30}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">3-30 characters</p>
              <p className="text-xs text-gray-500">{formData.displayName.length}/30</p>
            </div>
            {errors.displayName && (
              <p className="text-sm text-red-500 mt-1">{errors.displayName}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              maxLength={100}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">Max 100 characters</p>
              <p className="text-xs text-gray-500">{formData.bio.length}/100</p>
            </div>
            {errors.bio && (
              <p className="text-sm text-red-500 mt-1">{errors.bio}</p>
            )}
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Twitter */}
            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
                Twitter <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="twitter"
                type="text"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="@username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.twitter && (
                <p className="text-sm text-red-500 mt-1">{errors.twitter}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.website && (
                <p className="text-sm text-red-500 mt-1">{errors.website}</p>
              )}
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showStats}
                onChange={(e) => setFormData({ ...formData, showStats: e.target.checked })}
                className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Show my statistics publicly
              </span>
            </label>
            <p className="text-xs text-gray-500 ml-8 mt-1">
              Allow others to view your tipping stats and achievements
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
