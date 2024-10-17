import { isNull } from '@/utils/validation/is/null';
import {
  usePathname,
  useSearchParams,
} from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export const useQueryParamsSet = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = {
    pathname,
  };
  const currentRef = useRef(current);
  currentRef.current = current;

  const handler = (key: string, value: string) => {
    if (!isNull(searchParams)) {
      const params = new URLSearchParams(
        searchParams.toString()
      );
      params.set(key, value);
      router.push(
        `${currentRef.current.pathname}?${params}`
      );
    }
  };

  return handler;
};
