import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { uploadApi } from './queryFunction';

// Hook for uploading a file
export const useUploadFile = (options?: UseMutationOptions<{ url: string; filename: string }, Error, File>) => {
  return useMutation<{ url: string; filename: string }, Error, File>({
    mutationFn: uploadApi.uploadFile,
    ...options,
  });
};

// Hook for deleting a file
export const useDeleteImage = (options?: UseMutationOptions<{ message: string }, Error, string>) => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: uploadApi.deleteImage,
    ...options,
  });
};
export * from './queryFunction';
