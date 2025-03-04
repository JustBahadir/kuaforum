
import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 px-4 mt-12">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Kuaför Randevu Sistemi. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
};
