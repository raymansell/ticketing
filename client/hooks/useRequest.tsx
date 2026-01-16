import { ReactNode, useState } from 'react';
import axios, { AxiosRequestConfig, Method } from 'axios';

interface Props<T> {
  url: string;
  method: Method;
  body: object;
  onSuccess?: (data: T) => void;
}

type CustomErrorResponseData = Record<
  'errors',
  { message: string; field?: string }[]
>;

export const useRequest = <T,>({ url, method, body, onSuccess }: Props<T>) => {
  const [errors, setErrors] = useState<ReactNode | null>(null);

  const doRequest = async (props = {}) => {
    try {
      setErrors(null);
      const config: AxiosRequestConfig = {
        url: url,
        method: method,
        data: { ...body, ...props },
      };
      const response = await axios.request<T>(config);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError<CustomErrorResponseData>(error)) {
        setErrors(
          <div className='alert alert-danger'>
            <h4>Oops...</h4>
            <ul className='my-0'>
              {error.response?.data.errors.map((err) => (
                <li key={err.message}>{err.message}</li>
              ))}
            </ul>
          </div>
        );
      } else {
        // Handle non-Axios errors (e.g., network issues, local code errors)
        console.error('An unexpected error occurred:', error);
      }
    }
  };

  return { doRequest, errors };
};
