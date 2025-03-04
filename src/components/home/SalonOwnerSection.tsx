
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const SalonOwnerSection = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/admin");
  };

  const handleRegisterClick = () => {
    navigate("/admin/register");
  };

  return (
    <div className="w-full lg:w-[35%] bg-gradient-to-br from-indigo-100 to-purple-50 rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-indigo-800 mb-4">Kuaför Salonu Sahibi misiniz?</h2>
      
      <p className="text-gray-700 mb-6">
        Salonunuzu dijital dünyaya taşıyın! Randevu sistemi, müşteri yönetimi ve daha fazlası için hemen kaydolun.
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="ml-3 text-gray-700">Randevuları kolayca yönetin</span>
        </div>
        
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="ml-3 text-gray-700">Müşteri sadakatini artırın</span>
        </div>
        
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="ml-3 text-gray-700">İş akışınızı optimize edin</span>
        </div>
      </div>
      
      <div className="mt-8 space-y-3">
        <Button 
          onClick={handleLoginClick}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          Giriş Yap
        </Button>
        
        <Button 
          onClick={handleRegisterClick}
          variant="outline" 
          className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50"
        >
          Kayıt Ol
        </Button>
      </div>
    </div>
  );
};
