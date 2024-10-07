'use client';
import { ButtonsCvaButton } from '@/components/cva/button';
import { useEffect } from 'react';
import { ToastOptions, toast } from 'react-toastify';

export const TestNotifications_ = () => {
  const title = 'show';
  const OPTIONS: ToastOptions<string> = {
    delay: 0,
  };
  const show = () => {
    toast.error('Error: Something went wrong', OPTIONS);
    toast.info('Info: Call 123123123 for help', OPTIONS);
    toast.success('Download complete.', OPTIONS);
    toast.warn('Running low in memory.', OPTIONS);
  };
  useEffect(() => {
    show()
  }, []);

  return (
    <div className='flex items-center justify-center'>
      <ButtonsCvaButton title={title} onTap={show} size='md' intent='ghost-1'>
        {title}
      </ButtonsCvaButton>
    </div>
  );
};
