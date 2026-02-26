import React, { useState, useEffect } from 'react';
import Textarea from './Textarea';

interface JsonEditorProps {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>, isValid: boolean) => void;
  id: string;
  label?: string;
  className?: string;
  rows?: number;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, id, label, className, rows = 10 }) => {
  const [jsonString, setJsonString] = useState<string>(JSON.stringify(value, null, 2));
  const [isValid, setIsValid] = useState<boolean>(true);

  useEffect(() => {
    // Update internal string when external value changes, but only if it's different
    const newJsonString = JSON.stringify(value, null, 2);
    if (newJsonString !== jsonString) {
      setJsonString(newJsonString);
      setIsValid(true); // Assume external value is valid
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setJsonString(newValue);

    try {
      const parsed = JSON.parse(newValue);
      setIsValid(true);
      onChange(parsed, true);
    } catch (error) {
      setIsValid(false);
      onChange({}, false); // Notify parent that the JSON is invalid
    }
  };

  const handleBlur = () => {
    // On blur, re-format the JSON if it's valid
    if (isValid) {
      try {
        const parsed = JSON.parse(jsonString);
        setJsonString(JSON.stringify(parsed, null, 2));
      } catch (error) {
        // Should not happen if isValid is true, but good to catch
        console.error("Error re-formatting JSON on blur:", error);
      }
    }
  };

  return (
    <div className={className}>
      <Textarea
        id={id}
        label={label}
        value={jsonString}
        onChange={handleChange}
        onBlur={handleBlur}
        rows={rows}
        className={!isValid ? 'border-red-500 focus:ring-red-500' : ''}
      />
      {!isValid && <p className="text-sm text-red-500 mt-1">Invalid JSON format</p>}
    </div>
  );
};

export default JsonEditor;
