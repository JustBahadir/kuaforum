
/**
 * A utility function to create disabled components
 * This is used temporarily to disable components that cause build errors
 */
import React from 'react';

export const createDisabledComponent = (componentName: string) => {
  const DisabledComponent = () => {
    return null; // Return null to render nothing
  };
  
  return DisabledComponent;
};
