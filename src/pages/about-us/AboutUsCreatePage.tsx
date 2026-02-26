import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aboutUsApi } from '../../api/aboutUs';
import type { AboutUsDto, ApiError } from '../../api/types';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import JsonEditor from '../../components/ui/JsonEditor';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

const AboutUsCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<AboutUsDto>({});
  const [isJsonValid, setIsJsonValid] = useState<boolean>(true);

  const createAboutUsMutation = useMutation<AboutUsDto, AxiosError, AboutUsDto>({
    mutationFn: aboutUsApi.create,
    onSuccess: (data) => {
      toast.success(`About Us entry created successfully with ID: ${data.id}`);
      queryClient.invalidateQueries({ queryKey: ['aboutUs'] }); // Invalidate any list/detail queries
      navigate(`/about-us/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to create About Us entry: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleJsonChange = (value: Record<string, unknown>, isValid: boolean) => {
    setFormData(value);
    setIsJsonValid(isValid);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isJsonValid) {
      toast.error('Please correct the invalid JSON.');
      return;
    }
    createAboutUsMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New About Us Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <JsonEditor
              id="aboutUsJsonEditor"
              label="About Us Data (JSON)"
              value={formData}
              onChange={handleJsonChange}
              rows={20}
            />
            <Button
              type="submit"
              disabled={createAboutUsMutation.isPending || !isJsonValid}
              className="w-full"
            >
              {createAboutUsMutation.isPending ? <Spinner size="sm" /> : 'Create About Us'}
            </Button>
            {createAboutUsMutation.isError && (
              <p className="text-red-500 text-sm text-center">
                {createAboutUsMutation.error?.response?.data?.message || createAboutUsMutation.error?.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutUsCreatePage;
