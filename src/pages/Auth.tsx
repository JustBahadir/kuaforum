
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Home, UserPlus, LogIn } from 'lucide-react'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'

export default function Auth() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Form fields for login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Form fields for register
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  // Active tab state
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  // Info messages per tab to show feedback or suggestions
  const [loginInfoMsg, setLoginInfoMsg] = useState<string | null>(null)
  const [registerInfoMsg, setRegisterInfoMsg] = useState<string | null>(null)

  // Reset all form fields and info messages
  const resetForms = () => {
    setLoginEmail('')
    setLoginPassword('')
    setRegisterEmail('')
    setRegisterPassword('')
    setFirstName('')
    setLastName('')
    setLoginInfoMsg(null)
    setRegisterInfoMsg(null)
    toast.dismiss()
  }

  // Reset forms/messages when tab changes
  useEffect(() => {
    resetForms()
  }, [activeTab])

  // Check if already logged in - redirect accordingly
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Session check error:', error)
          return
        }
        if (data.session) {
          const userMetadata = data.session.user?.user_metadata
          const userRole = userMetadata?.role || 'customer'

          // Check if profile filled (first_name, last_name, phone)
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, phone, role')
            .eq('id', data.session.user.id)
            .single()

          const profileSetupComplete =
            profileData && profileData.first_name && profileData.last_name && profileData.phone

          if (!profileSetupComplete) {
            navigate('/profile-setup')
            return
          }

          if (userRole === 'customer') {
            navigate('/customer-dashboard')
          } else if (userRole === 'admin' || userRole === 'staff') {
            navigate('/admin/dashboard')
          } else {
            navigate('/profile-setup')
          }
        }
      } catch (err) {
        console.error('Session check failed:', err)
      }
    }
    checkSession()
  }, [navigate])

  // Login form submit handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginInfoMsg(null)

    if (!loginEmail) {
      toast.error('Lütfen e-posta adresinizi girin')
      return
    }
    if (!loginPassword) {
      toast.error('Lütfen şifrenizi girin')
      return
    }

    setLoading(true)
    try {
      // Try signing in with email & password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (error) {
        // User not found or invalid credentials
        if (
          error.message.includes('User not found') ||
          error.message.includes('Invalid login credentials')
        ) {
          setLoginInfoMsg(
            "Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı. Lütfen kayıt olunuz."
          )
          toast.error(
            "Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı. Lütfen kayıt olunuz."
          )
          setActiveTab('register')
          setLoading(false)
          return
        }
        toast.error(error.message)
        setLoading(false)
        return
      }

      const metadata = data.user?.user_metadata || {}
      // Only customers can login here, others get blocked
      if (metadata.role && metadata.role !== 'customer') {
        await supabase.auth.signOut()
        toast.error('Bu giriş sadece müşteriler içindir.')
        setLoading(false)
        return
      }

      // Check if profile setup complete
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, role')
        .eq('id', data.user.id)
        .single()

      const profileSetupComplete =
        profileData && profileData.first_name && profileData.last_name && profileData.phone

      if (!profileSetupComplete) {
        navigate('/profile-setup')
        setLoading(false)
        return
      }

      toast.success('Giriş başarılı!')
      navigate('/customer-dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Giriş sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }
  
  // Register form submit handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterInfoMsg(null)

    if (!registerEmail) {
      toast.error('Lütfen e-posta adresinizi girin')
      return
    }
    if (!registerPassword) {
      toast.error('Lütfen şifrenizi girin')
      return
    }
    if (!firstName.trim()) {
      toast.error('Lütfen adınızı girin')
      return
    }
    if (!lastName.trim()) {
      toast.error('Lütfen soyadınızı girin')
      return
    }

    setLoading(true)
    try {
      // Before signup, check if user already exists using Supabase Admin client
      // Supabase JS client does not give direct "user exists" easily, so we attempt signUp and check error message

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'customer',
          },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setRegisterInfoMsg(
            'Bu e-posta zaten kayıtlı. Lütfen Giriş Yap sekmesini kullanarak devam edin.'
          )
          toast.error(
            'Bu e-posta zaten kayıtlı. Lütfen Giriş Yap sekmesini kullanarak devam edin.'
          )
          setActiveTab('login')
          setLoading(false)
          return
        }
        toast.error(signUpError.message)
        setLoading(false)
        return
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        toast.error('Kayıt sonrası oturum alınamadı')
        setLoading(false)
        return
      }

      if (sessionData.session?.user) {
        const userId = sessionData.session.user.id
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone, role')
          .eq('id', userId)
          .single()

        const profileSetupComplete =
          profileData && profileData.first_name && profileData.last_name && profileData.phone

        if (!profileSetupComplete) {
          toast.success('Kayıt başarılı! Profil bilgilerinizi tamamlayınız.')
          navigate('/profile-setup')
          setLoading(false)
          return
        }

        if (profileData.role === 'customer') {
          toast.success('Kayıt başarılı! Giriş yapabilirsiniz.')
          navigate('/customer-dashboard')
        } else if (profileData.role === 'admin' || profileData.role === 'staff') {
          toast.success('Kayıt başarılı! Giriş yapabilirsiniz.')
          navigate('/admin/dashboard')
        } else {
          navigate('/profile-setup')
        }
      } else {
        toast.error('Kayıt sonrası oturum açma başarısız.')
        navigate('/auth')
      }
    } catch (error: any) {
      toast.error(error.message || 'Kayıt sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  // Custom handlers for Google sign-in success to show proper toasts based on active tab
  // Unfortunately GoogleAuthButton does not provide success callback, so we will handle with Supabase onAuthStateChange elsewhere

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 px-8 rounded-t-md">
          <CardTitle className="text-center text-lg font-semibold">Kuaför Girişi</CardTitle>
          <CardDescription className="text-center">Giriş Yap veya Kayıt Ol sekmesini kullanın</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as 'login' | 'register')
            }}
            className="space-y-6"
            defaultValue="login"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-gray-200 p-1">
              <TabsTrigger
                value="login"
                className={`flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === 'login' ? 'bg-white text-purple-700 shadow-md' : 'text-gray-500'
                }`}
              >
                <LogIn size={16} />
                Giriş Yap
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className={`flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === 'register' ? 'bg-white text-purple-700 shadow-md' : 'text-gray-500'
                }`}
              >
                <UserPlus size={16} />
                Kayıt Ol
              </TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login" className="space-y-6">
              <div className="text-center mb-4 font-semibold text-gray-700">
                GOOGLE İLE GİRİŞ YAP
              </div>
              <GoogleAuthButton
                text="Google ile Giriş Yap"
                className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
                redirectTo={window.location.origin + '/auth-google-callback'}
              />
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase text-muted-foreground bg-gray-50">
                  veya
                </div>
              </div>
              <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                {loginInfoMsg && (
                  <div className="p-3 mb-2 bg-yellow-200 border border-yellow-400 rounded text-yellow-900 text-sm">
                    {loginInfoMsg}{' '}
                    <button
                      type="button"
                      className="underline font-semibold"
                      onClick={() => setActiveTab('register')}
                    >
                      Kayıt Ol sekmesine geç
                    </button>
                  </div>
                )}
                <div>
                  <Label htmlFor="loginEmail">E-posta</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="loginPassword">Şifre</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Button variant="link" asChild>
                  <Link to="/admin" className="text-sm text-gray-600 hover:underline">
                    Personel olarak giriş yapmak için tıklayın
                  </Link>
                </Button>
              </div>
            </TabsContent>

            {/* REGISTER TAB */}
            <TabsContent value="register" className="space-y-6">
              <div className="text-center mb-4 font-semibold text-gray-700">
                GOOGLE İLE KAYIT OL
              </div>
              <GoogleAuthButton
                text="Google ile Kayıt Ol"
                className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
                redirectTo={window.location.origin + '/auth-google-callback'}
              />
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase text-muted-foreground bg-gray-50">
                  veya
                </div>
              </div>
              <form onSubmit={handleSignUp} className="space-y-4" noValidate>
                {registerInfoMsg && (
                  <div className="p-3 mb-2 bg-yellow-200 border border-yellow-400 rounded text-yellow-900 text-sm">
                    {registerInfoMsg}{' '}
                    <button
                      type="button"
                      className="underline font-semibold"
                      onClick={() => setActiveTab('login')}
                    >
                      Giriş Yap sekmesine geç
                    </button>
                  </div>
                )}
                <div>
                  <Label htmlFor="registerEmail">E-posta</Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="registerPassword">Şifre</Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="registerFirstName">Ad</Label>
                  <Input
                    id="registerFirstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="registerLastName">Soyad</Label>
                  <Input
                    id="registerLastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center space-y-3">
            <Button variant="secondary" asChild className="w-full">
              <Link to="/" className="flex items-center justify-center gap-2">
                <Home size={16} />
                Ana Sayfaya Dön
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-600">
          Kuaför randevu sistemi &copy; 2024
        </CardFooter>
      </Card>
    </div>
  )
}
