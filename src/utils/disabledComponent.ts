
import React from 'react';

/**
 * Creates an empty component that renders nothing
 * Used to temporarily disable components that cause build errors
 */
export const createDisabledComponent = (componentName: string) => {
  const EmptyComponent = () => null;
  console.log(`Component "${componentName}" is temporarily disabled`);
  return EmptyComponent;
};
