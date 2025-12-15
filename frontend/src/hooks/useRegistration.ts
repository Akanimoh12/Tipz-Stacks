import { useState, useCallback } from 'react';
import { uploadProfileImage, uploadMetadata } from '../services/pinataService';
import { registerCreatorOnChain, getAllCreators, getCreatorInfo, isCreatorRegistered } from '../services/contractService';
import { useWallet } from './useWallet';
import { debounce } from '../utils/helpers';

export interface PortfolioLink {
  title: string;
  url: string;
}

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
}

export interface RegistrationFormData {
  name: string;
  bio: string;
  profileImage: File | null;
  profileImagePreview: string | null;
  categories: string[];
  social: SocialLinks;
  portfolio: PortfolioLink[];
}

export interface RegistrationState {
  currentStep: number;
  formData: RegistrationFormData;
  isUploading: boolean;
  uploadProgress: number;
  isRegistering: boolean;
  error: string | null;
  imageCid: string | null;
  metadataCid: string | null;
  transactionId: string | null;
  isSuccess: boolean;
}

const initialFormData: RegistrationFormData = {
  name: '',
  bio: '',
  profileImage: null,
  profileImagePreview: null,
  categories: [],
  social: {},
  portfolio: [],
};

export const useRegistration = () => {
  const { walletAddress } = useWallet();
  
  const [state, setState] = useState<RegistrationState>({
    currentStep: 1,
    formData: initialFormData,
    isUploading: false,
    uploadProgress: 0,
    isRegistering: false,
    error: null,
    imageCid: null,
    metadataCid: null,
    transactionId: null,
    isSuccess: false,
  });

  // Real-time validation state
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isCheckingAddress, setIsCheckingAddress] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // Check if creator name is already taken
  const checkNameAvailability = useCallback(async (name: string): Promise<boolean> => {
    if (!name || name.length < 3) {
      setNameAvailable(null);
      return false;
    }
    
    setIsCheckingName(true);
    try {
      // Fetch all creators and check if name exists
      const creators = await getAllCreators();
      const creatorInfos = await Promise.all(
        creators.map(addr => getCreatorInfo(addr))
      );
      
      const nameExists = creatorInfos.some(
        info => info && info.name.toLowerCase() === name.toLowerCase()
      );
      
      setNameAvailable(!nameExists);
      setIsCheckingName(false);
      return !nameExists;
    } catch (error) {
      console.error('Error checking name availability:', error);
      setIsCheckingName(false);
      setNameAvailable(null);
      return false;
    }
  }, []);

  // Check if address is already registered
  const checkAddressRegistration = useCallback(async (address: string): Promise<boolean> => {
    if (!address) return false;
    
    setIsCheckingAddress(true);
    try {
      const isRegistered = await isCreatorRegistered(address);
      setAlreadyRegistered(isRegistered);
      setIsCheckingAddress(false);
      return isRegistered;
    } catch (error) {
      console.error('Error checking address registration:', error);
      setIsCheckingAddress(false);
      return false;
    }
  }, []);

  // Debounced name check (500ms delay)
  const debouncedNameCheck = useCallback(
    debounce((name: string) => {
      checkNameAvailability(name);
    }, 500),
    [checkNameAvailability]
  );

  const updateFormField = useCallback((field: keyof RegistrationFormData, value: any) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
      error: null,
    }));
  }, []);

  const updateSocialLink = useCallback((platform: keyof SocialLinks, value: string) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        social: {
          ...prev.formData.social,
          [platform]: value,
        },
      },
    }));
  }, []);

  const addPortfolioLink = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        portfolio: [...prev.formData.portfolio, { title: '', url: '' }],
      },
    }));
  }, []);

  const updatePortfolioLink = useCallback((index: number, field: keyof PortfolioLink, value: string) => {
    setState(prev => {
      const newPortfolio = [...prev.formData.portfolio];
      newPortfolio[index] = { ...newPortfolio[index], [field]: value };
      return {
        ...prev,
        formData: {
          ...prev.formData,
          portfolio: newPortfolio,
        },
      };
    });
  }, []);

  const removePortfolioLink = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        portfolio: prev.formData.portfolio.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const handleImageSelect = useCallback((file: File) => {
    // Validate file
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setState(prev => ({ ...prev, error: 'Please select a valid image file (JPG, PNG, or WebP)' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setState(prev => ({ ...prev, error: 'Image must be less than 5MB' }));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          profileImage: file,
          profileImagePreview: reader.result as string,
        },
        error: null,
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  const validateStep = useCallback((step: number): { valid: boolean; error: string | null } => {
    const { formData } = state;

    switch (step) {
      case 1: // Basic Info
        if (!formData.name.trim()) {
          return { valid: false, error: 'Creator name is required' };
        }
        if (formData.name.length < 3 || formData.name.length > 50) {
          return { valid: false, error: 'Name must be between 3 and 50 characters' };
        }
        if (!formData.bio.trim()) {
          return { valid: false, error: 'Bio is required' };
        }
        if (formData.bio.length < 50 || formData.bio.length > 500) {
          return { valid: false, error: 'Bio must be between 50 and 500 characters' };
        }
        return { valid: true, error: null };

      case 2: // Profile Image
        if (!formData.profileImage) {
          return { valid: false, error: 'Profile image is required' };
        }
        return { valid: true, error: null };

      case 3: // Social Links & Portfolio
        // All optional, but validate URLs if provided
        const urlRegex = /^https?:\/\/.+/;
        
        if (formData.social.twitter && !urlRegex.test(formData.social.twitter)) {
          return { valid: false, error: 'Invalid Twitter URL' };
        }
        if (formData.social.instagram && !urlRegex.test(formData.social.instagram)) {
          return { valid: false, error: 'Invalid Instagram URL' };
        }
        if (formData.social.youtube && !urlRegex.test(formData.social.youtube)) {
          return { valid: false, error: 'Invalid YouTube URL' };
        }
        if (formData.social.website && !urlRegex.test(formData.social.website)) {
          return { valid: false, error: 'Invalid website URL' };
        }

        for (const link of formData.portfolio) {
          if (link.title && !link.url) {
            return { valid: false, error: 'Portfolio link URL is required when title is provided' };
          }
          if (link.url && !urlRegex.test(link.url)) {
            return { valid: false, error: 'Invalid portfolio URL' };
          }
        }

        return { valid: true, error: null };

      default:
        return { valid: true, error: null };
    }
  }, [state]);

  const goToStep = useCallback((step: number) => {
    const validation = validateStep(state.currentStep);
    if (!validation.valid && step > state.currentStep) {
      setState(prev => ({ ...prev, error: validation.error }));
      return;
    }

    setState(prev => ({ ...prev, currentStep: step, error: null }));
  }, [state.currentStep, validateStep]);

  const nextStep = useCallback(() => {
    const validation = validateStep(state.currentStep);
    if (!validation.valid) {
      setState(prev => ({ ...prev, error: validation.error }));
      return;
    }

    if (state.currentStep < 4) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1, error: null }));
    }
  }, [state.currentStep, validateStep]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep - 1, error: null }));
    }
  }, [state.currentStep]);

  const uploadImage = useCallback(async (): Promise<string> => {
    if (!state.formData.profileImage) {
      throw new Error('No image selected');
    }

    setState(prev => ({ ...prev, isUploading: true, uploadProgress: 0, error: null }));

    try {
      const cid = await uploadProfileImage(state.formData.profileImage, (progress) => {
        setState(prev => ({ ...prev, uploadProgress: progress }));
      });

      setState(prev => ({ ...prev, imageCid: cid, uploadProgress: 50 }));
      return cid;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: error.message || 'Failed to upload image',
      }));
      throw error;
    }
  }, [state.formData.profileImage]);

  const uploadMetadataToIPFS = useCallback(async (imageCid: string): Promise<string> => {
    const metadata = {
      name: state.formData.name,
      bio: state.formData.bio,
      profileImage: imageCid,
      categories: state.formData.categories,
      social: state.formData.social,
      portfolio: state.formData.portfolio.filter(link => link.title && link.url),
      createdAt: new Date().toISOString(),
    };

    try {
      setState(prev => ({ ...prev, uploadProgress: 75 }));
      const cid = await uploadMetadata(metadata);
      setState(prev => ({ ...prev, metadataCid: cid, uploadProgress: 100, isUploading: false }));
      return cid;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: error.message || 'Failed to upload metadata',
      }));
      throw error;
    }
  }, [state.formData]);

  const submitRegistration = useCallback(async () => {
    if (!walletAddress) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    // Validate all steps
    for (let step = 1; step <= 3; step++) {
      const validation = validateStep(step);
      if (!validation.valid) {
        setState(prev => ({ ...prev, error: validation.error, currentStep: step }));
        return;
      }
    }

    setState(prev => ({ ...prev, isRegistering: true, error: null }));

    try {
      // Step 1: Upload image to IPFS
      const imageCid = await uploadImage();

      // Step 2: Upload metadata to IPFS
      const metadataCid = await uploadMetadataToIPFS(imageCid);

      // Step 3: Register on blockchain
      const metadataUri = `ipfs://${metadataCid}`;
      const txId = await registerCreatorOnChain(
        state.formData.name,
        metadataUri,
        walletAddress
      );

      setState(prev => ({
        ...prev,
        isRegistering: false,
        transactionId: txId,
        isSuccess: true,
      }));
    } catch (error: any) {
      console.error('Registration failed:', error);
      setState(prev => ({
        ...prev,
        isRegistering: false,
        isUploading: false,
        error: error.message || 'Registration failed. Please try again.',
      }));
    }
  }, [walletAddress, validateStep, uploadImage, uploadMetadataToIPFS, state.formData.name]);

  const reset = useCallback(() => {
    setState({
      currentStep: 1,
      formData: initialFormData,
      isUploading: false,
      uploadProgress: 0,
      isRegistering: false,
      error: null,
      imageCid: null,
      metadataCid: null,
      transactionId: null,
      isSuccess: false,
    });
  }, []);

  return {
    ...state,
    updateFormField,
    updateSocialLink,
    addPortfolioLink,
    updatePortfolioLink,
    removePortfolioLink,
    handleImageSelect,
    validateStep,
    goToStep,
    nextStep,
    prevStep,
    submitRegistration,
    reset,
    // Real-time validation
    isCheckingName,
    isCheckingAddress,
    nameAvailable,
    alreadyRegistered,
    checkNameAvailability,
    checkAddressRegistration,
    debouncedNameCheck,
  };
};
