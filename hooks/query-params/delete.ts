import {usePathname, useSearchParams} from 'next/navigation';
import {useRouter} from 'next/navigation';
import { isNull } from '@/utils/validation/is/null';

export const useQueryParamsDelete = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const handler = (key: string) => {
    if (!isNull(searchParams)) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      router.push(`${pathname}?${params}`);
    }
  };

  return handler;
};
