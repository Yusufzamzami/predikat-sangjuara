import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Award, BarChart3, Target, Users, Calculator } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="p-4 bg-primary rounded-full">
              <GraduationCap className="h-12 w-12 text-primary-foreground" />
            </div>
            <Award className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Sistem Pendukung Keputusan
          </h1>
          <h2 className="text-3xl font-semibold text-primary mb-6">
            Pemilihan Mahasiswa Berprestasi
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Sistem berbasis web yang menggunakan metode AHP dan SAW untuk menentukan 
            mahasiswa berprestasi secara objektif dan terstruktur
          </p>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="text-lg px-8 py-6"
          >
            Masuk ke Sistem
          </Button>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-blue-100 rounded-full w-fit">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Manajemen Data</CardTitle>
              <CardDescription>
                Kelola data mahasiswa dan kriteria penilaian dengan mudah
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Input data mahasiswa lengkap</li>
                <li>• Pengaturan kriteria penilaian</li>
                <li>• Sistem CRUD yang user-friendly</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-green-100 rounded-full w-fit">
                <Calculator className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Metode AHP</CardTitle>
              <CardDescription>
                Analytical Hierarchy Process untuk bobot kriteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Perbandingan berpasangan kriteria</li>
                <li>• Perhitungan bobot otomatis</li>
                <li>• Uji konsistensi matriks</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-purple-100 rounded-full w-fit">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Metode SAW</CardTitle>
              <CardDescription>
                Simple Additive Weighting untuk perangkingan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Normalisasi nilai mahasiswa</li>
                <li>• Perhitungan skor akhir</li>
                <li>• Ranking otomatis mahasiswa</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-orange-100 rounded-full w-fit">
                <Award className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle>Hasil & Laporan</CardTitle>
              <CardDescription>
                Visualisasi hasil dan export laporan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Dashboard hasil penilaian</li>
                <li>• Export PDF laporan</li>
                <li>• Grafik dan statistik</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-red-100 rounded-full w-fit">
                <Target className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle>Objektif & Akurat</CardTitle>
              <CardDescription>
                Penilaian berbasis kriteria yang terstruktur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Mengurangi subjektivitas</li>
                <li>• Transparansi proses penilaian</li>
                <li>• Hasil yang dapat dipertanggungjawabkan</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-indigo-100 rounded-full w-fit">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
              </div>
              <CardTitle>User Friendly</CardTitle>
              <CardDescription>
                Interface yang mudah digunakan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Desain modern dan responsif</li>
                <li>• Navigasi yang intuitif</li>
                <li>• Panduan penggunaan lengkap</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Process Flow */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-foreground mb-8">Alur Proses Sistem</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4">
                1
              </div>
              <h4 className="font-semibold text-foreground mb-2">Input Data</h4>
              <p className="text-sm text-muted-foreground">Masukkan data mahasiswa dan kriteria penilaian</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4">
                2
              </div>
              <h4 className="font-semibold text-foreground mb-2">Penilaian AHP</h4>
              <p className="text-sm text-muted-foreground">Tentukan bobot kriteria dengan metode AHP</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4">
                3
              </div>
              <h4 className="font-semibold text-foreground mb-2">Perhitungan SAW</h4>
              <p className="text-sm text-muted-foreground">Hitung skor akhir dengan metode SAW</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4">
                4
              </div>
              <h4 className="font-semibold text-foreground mb-2">Hasil & Laporan</h4>
              <p className="text-sm text-muted-foreground">Lihat ranking dan download laporan PDF</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Siap Memulai?</CardTitle>
              <CardDescription>
                Bergabunglah dan rasakan kemudahan sistem penilaian mahasiswa berprestasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                Masuk ke Dashboard Admin
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
