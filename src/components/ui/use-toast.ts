import { useState, useEffect } from 'react';

interface ToastProps {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = (props: ToastProps) => {
    setToasts((prevToasts) => [...prevToasts, props]);
  };

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prevToasts) => prevToasts.slice(1));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toasts]);

  return { toast, toasts };
};
