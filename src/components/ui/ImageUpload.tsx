import React, { useRef, useState } from "react";
import { imageApi } from "../../api/image";
import Spinner from "./Spinner";
import styles from "./ImageUpload.module.css";
import { toast } from "react-hot-toast";

interface ImageUploadProps {
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  label?: string;
  className?: string;
  multiple?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label, className, multiple }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return await imageApi.upload(formData);
      });

      const results = await Promise.all(uploadPromises);
      // Backend returns 'imageUrl', we map it here
      const urls = results.map(r => r.imageUrl);

      if (multiple) {
        const currentUrls = Array.isArray(value) ? value : (value ? [value] : []);
        onChange([...currentUrls, ...urls]);
      } else {
        onChange(urls[0]);
      }
      toast.success(multiple ? "Images uploaded successfully!" : "Image uploaded successfully!");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload image(s).");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    if (multiple && Array.isArray(value)) {
      const newValues = [...value];
      newValues.splice(index, 1);
      onChange(newValues);
    } else {
      onChange("");
    }
  };

  const renderPreviews = () => {
    if (multiple && Array.isArray(value)) {
      return (
        <div className={styles.multiPreviewGrid}>
          {value.map((url, index) => (
            <div key={index} className={styles.previewItem}>
              <img src={url} alt={`Preview ${index}`} className={styles.image} />
              <button
                type="button"
                className={styles.removeBtnSmall}
                onClick={() => removeImage(index)}
              >
                ×
              </button>
            </div>
          ))}
          <div
            className={styles.addMorePlaceholder}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? <Spinner size="sm" /> : "+ Add"}
          </div>
        </div>
      );
    }

    if (!multiple && typeof value === "string" && value) {
      return (
        <div className={styles.preview}>
          <img src={value} alt="Preview" className={styles.image} />
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => removeImage(0)}
          >
            ×
          </button>
        </div>
      );
    }

    return (
      <div
        className={styles.placeholder}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? <Spinner /> : "Click to upload"}
      </div>
    );
  };

  return (
    <div className={`${styles.container} ${className || ""}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={multiple && Array.isArray(value) && value.length > 0 ? styles.multiContainer : styles.previewContainer}>
        {renderPreviews()}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className={styles.hiddenInput}
        accept="image/*"
        multiple={multiple}
      />
    </div>
  );
};

export default ImageUpload;
