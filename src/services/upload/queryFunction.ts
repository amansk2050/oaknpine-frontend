import axiosInstance from '../axiosinstance';

export const uploadApi = {
  // Upload a single file using multipart/form-data
  uploadFile: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<{ url: string; filename: string }>(
      '/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Delete an uploaded image from server by its URL
  deleteImage: async (url: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<{ message: string }>('/upload/image', {
      data: { url },
    });
    return response.data;
  },
};
