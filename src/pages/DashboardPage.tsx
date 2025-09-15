import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Award, TrendingUp, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalStudents: number;
  totalCriteria: number;
  completedAssessments: number;
  topStudent: {
    nama: string;
    total_score: number;
  } | null;
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCriteria: 0,
    completedAssessments: 0,
    topStudent: null,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Get total students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id');
      
      if (studentsError) throw studentsError;

      // Get total criteria
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('criteria')
        .select('id');
      
      if (criteriaError) throw criteriaError;

      // Get completed assessments count
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select('id');
      
      if (assessmentsError) throw assessmentsError;

      // Get top student from results
      const { data: topStudentData, error: topStudentError } = await supabase
        .from('results')
        .select(`
          total_score,
          student:students(nama)
        `)
        .order('total_score', { ascending: false })
        .limit(1);
      
      if (topStudentError) throw topStudentError;

      setStats({
        totalStudents: studentsData?.length || 0,
        totalCriteria: criteriaData?.length || 0,
        completedAssessments: assessmentsData?.length || 0,
        topStudent: topStudentData?.[0] ? {
          nama: (topStudentData[0].student as any)?.nama || '',
          total_score: topStudentData[0].total_score
        } : null,
      });

    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Mahasiswa",
      value: stats.totalStudents,
      description: "Mahasiswa terdaftar dalam sistem",
      icon: Users,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Kriteria Penilaian",
      value: stats.totalCriteria,
      description: "Kriteria yang digunakan untuk penilaian",
      icon: Target,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Penilaian",
      value: stats.completedAssessments,
      description: "Penilaian yang telah dilakukan",
      icon: BarChart3,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Mahasiswa Terbaik",
      value: stats.topStudent?.nama || "Belum ada",
      description: stats.topStudent 
        ? `Skor: ${stats.topStudent.total_score.toFixed(4)}`
        : "Belum ada perhitungan SAW",
      icon: Award,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan Sistem Pendukung Keputusan Pemilihan Mahasiswa Berprestasi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tentang Sistem SPK
            </CardTitle>
            <CardDescription>
              Informasi mengenai metode yang digunakan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Metode AHP (Analytical Hierarchy Process)</h4>
              <p className="text-sm text-muted-foreground">
                Digunakan untuk menentukan bobot kepentingan setiap kriteria penilaian 
                melalui perbandingan berpasangan antar kriteria.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Metode SAW (Simple Additive Weighting)</h4>
              <p className="text-sm text-muted-foreground">
                Digunakan untuk menghitung skor akhir dan peringkat mahasiswa berdasarkan 
                nilai pada setiap kriteria yang telah diberi bobot.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Langkah Penggunaan Sistem
            </CardTitle>
            <CardDescription>
              Panduan menggunakan sistem SPK
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">
                  1
                </div>
                <p className="text-sm text-muted-foreground">
                  Input data mahasiswa dan kriteria penilaian
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">
                  2
                </div>
                <p className="text-sm text-muted-foreground">
                  Lakukan penilaian AHP untuk menentukan bobot kriteria
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">
                  3
                </div>
                <p className="text-sm text-muted-foreground">
                  Jalankan perhitungan SAW untuk mendapatkan hasil akhir
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">
                  4
                </div>
                <p className="text-sm text-muted-foreground">
                  Lihat ranking dan download laporan hasil
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;