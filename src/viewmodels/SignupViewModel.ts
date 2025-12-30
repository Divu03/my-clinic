import { useState } from 'react';

export const useSignupViewModel = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    // Basic validation before API integration
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setIsLoading(true);
    console.log("Registering User:", formData);
    // Future step: Connect to your backend using the Prisma-defined fields
    setIsLoading(false);
  };

  return {
    formData,
    updateField,
    isLoading,
    handleSignup,
  };
};