
/**
 * This file provides utilities to create disabled placeholder components
 * that can be used to temporarily replace components that are causing build errors.
 */

import React from 'react';

/**
 * Creates a disabled component that renders nothing
 * @param componentName The name of the component being disabled
 * @returns A React component that renders null
 */
export const createDisabledComponent = (componentName: string) => {
  return () => {
    console.log(`Component ${componentName} is currently disabled`);
    return null;
  };
};

/**
 * Creates a disabled component with props
 * @param componentName The name of the component being disabled
 * @returns A React component that accepts props but renders null
 */
export const createDisabledComponentWithProps = <T extends {}>(componentName: string) => {
  return (_props: T) => {
    console.log(`Component ${componentName} is currently disabled`);
    return null;
  };
};
