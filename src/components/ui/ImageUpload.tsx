import React, { useRef, useState } from "react";
import { imageApi } from "../../api/image";
import Spinner from "./Spinner";
import styles from "./ImageUpload.module.css";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label, className }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const result = await imageApi.upload(formData);
      // imageApi.upload returns ImageModelDto which has a 'url' property
      onChange(result.url);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`${styles.container} ${className || ""}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.previewContainer}>
        {value ? (
          <div className={styles.preview}>
            <img src={value} alt="Preview" className={styles.image} />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => onChange("")}
            >
              ×
            </button>
          </div>
        ) : (
          <div
            className={styles.placeholder}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? <Spinner /> : "Click to upload"}
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className={styles.hiddenInput}
        accept="image/*"
      />
    </div>
  );
};

export default ImageUpload;
