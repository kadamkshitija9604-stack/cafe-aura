'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Check } from 'lucide-react';
import { storageService } from '@/lib/services/storageService';
import { Button } from './Button';
import { Input } from './Input';
import { useToast } from './ToastProvider';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: 'menu' | 'staff' | 'branding';
  label?: string;
}

export function ImageUploader({ value, onChange, folder = 'menu', label = 'Image' }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [useDirectUrl, setUseDirectUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { error, success } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(10);
      const url = await storageService.uploadImage(file, folder, (progress) => {
        setUploadProgress(Math.round(progress));
      });
      onChange(url);
      success('Image Uploaded', 'Image has been successfully processed.');
    } catch (err: any) {
      error('Upload Failed', err.message || 'Could not upload image.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUseDirectUrl(false);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-aura-300">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setUseDirectUrl(!useDirectUrl)}
          className="text-xs text-caramel-400 hover:text-caramel-300 flex items-center gap-1 transition-colors"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          {useDirectUrl ? 'Upload file instead' : 'Enter image URL'}
        </button>
      </div>

      {useDirectUrl ? (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <Button type="button" size="md" onClick={handleApplyUrl}>
            Apply
          </Button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
          />

          {value ? (
            <div className="relative group rounded-xl overflow-hidden border border-aura-800 bg-espresso-950 aspect-video max-h-48 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Uploaded asset"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => onChange('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-aura-800 hover:border-caramel-500/60 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-espresso-900/40 hover:bg-espresso-900/80 transition-all text-center"
            >
              <div className="p-3 rounded-full bg-aura-800/40 text-caramel-400">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-aura-200">
                Click to upload image
              </p>
              <p className="text-xs text-aura-400">
                PNG, JPG, WEBP or AVIF (Max 5MB)
              </p>
            </div>
          )}

          {isUploading && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-aura-300 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-aura-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-caramel-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
