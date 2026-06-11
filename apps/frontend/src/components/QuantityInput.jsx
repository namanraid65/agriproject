import React, { useState, useEffect } from 'react';

export function QuantityInput({ value, max = 999, onChange, className, style }) {
  const [localVal, setLocalVal] = useState(value ? value.toString() : '1');

  // Sync local state when external value changes (e.g. +/- buttons)
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setLocalVal(value.toString());
    }
  }, [value]);

  const commitValue = (rawString) => {
    let parsed = parseInt(rawString, 10);
    if (isNaN(parsed) || parsed <= 0) {
      parsed = 1;
    }
    const limit = max > 0 ? max : 1;
    if (parsed > limit) {
      alert(`Only ${limit} units available in stock.`);
      parsed = limit;
    }
    setLocalVal(parsed.toString());
    if (onChange) {
      onChange(parsed);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      commitValue(localVal);
      e.currentTarget.blur();
    }
  };

  const handleChange = (e) => {
    const text = e.target.value;
    // Allow empty string or digits only
    if (text === '' || /^\d+$/.test(text)) {
      setLocalVal(text);
      
      const parsed = parseInt(text, 10);
      const limit = max > 0 ? max : 1;
      // Real-time update to parent if valid and within bounds
      if (!isNaN(parsed) && parsed > 0 && parsed <= limit) {
        if (onChange) {
          onChange(parsed);
        }
      }
    }
  };

  return (
    <input
      type="text"
      pattern="[0-9]*"
      inputMode="numeric"
      value={localVal}
      onChange={handleChange}
      onBlur={() => commitValue(localVal)}
      onKeyDown={handleKeyDown}
      className={className}
      style={style}
    />
  );
}

export default QuantityInput;
