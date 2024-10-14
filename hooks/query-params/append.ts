import {
  usePathname,
  useSearchParams,
} from 'next/navigation';
import { useRouter } from 'next/navigation';
import { isNull } from '@/utils/validation/is/null';

export const useQueryParamsAppend = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handler = (key: string, value: string) => {
    if (!isNull(searchParams)) {
      const values = searchParams.getAll(key);
      if (!values.includes(value)) {
        const params = new URLSearchParams(
          searchParams.toString()
        );
        params.append(key, value);
        console.log(
          'useQueryParamsAppend.handler ',
          pathname
        );
        router.push(`${pathname}?${params}`);
      }
    }
  };

  return handler;
};
