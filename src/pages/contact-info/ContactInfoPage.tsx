import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactInfoApi } from '../../api/contactInfo';
import type { ContactInfoDto } from '../../api/types';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import JsonEditor from '../../components/ui/JsonEditor';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';

const ContactInfoPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ContactInfoDto>({});
  const [isJsonValid, setIsJsonValid] = useState<boolean>(true);

  const {
    data: contactInfoData,
    isLoading: isQueryLoading,
    isError: isQueryError,
    error: queryError,
    refetch,
  } = useQuery<ContactInfoDto, Error>({
    queryKey: ['contactInfo'],
    queryFn: contactInfoApi.get,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (contactInfoData) {
      setFormData(contactInfoData);
    }
  }, [contactInfoData]);

  const upsertContactInfoMutation = useMutation<ContactInfoDto, AxiosError, ContactInfoDto>({
    mutationFn: contactInfoApi.upsert,
    onSuccess: () => {
      toast.success('Contact Info updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['contactInfo'] }); // Invalidate to refetch fresh data
    },
    onError: (error) => {
      toast.error(`Failed to update Contact Info: ${error.response?.data?.message || error.message}`);
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
    upsertContactInfoMutation.mutate(formData);
  };

  if (isQueryLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isQueryError) {
    return <p className="text-red-500 text-center">Error loading Contact Info: {queryError?.message}</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <JsonEditor
              id="contactInfoJsonEditor"
              label="Contact Info Data (JSON)"
              value={formData}
              onChange={handleJsonChange}
              rows={15}
            />
            <div className="flex space-x-2">
                <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isQueryLoading}>
                  Reload
                </Button>
                <Button
                  type="submit"
                  disabled={upsertContactInfoMutation.isPending || !isJsonValid}
                  className="flex-grow"
                >
                  {upsertContactInfoMutation.isPending ? <Spinner size="sm" /> : 'Save Contact Info'}
                </Button>
            </div>
            {upsertContactInfoMutation.isError && (
              <p className="text-red-500 text-sm text-center">
                {upsertContactInfoMutation.error?.response?.data?.message || upsertContactInfoMutation.error?.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInfoPage;
