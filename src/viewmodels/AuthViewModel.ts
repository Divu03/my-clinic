import { useState } from 'react';

export const useAuthViewModel = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // Future API call will go here
    console.log("Logging in with:", email);
    setIsLoading(false);
  };

  return {
    email, setEmail,
    password, setPassword,
    isLoading,
    handleLogin
  };
};