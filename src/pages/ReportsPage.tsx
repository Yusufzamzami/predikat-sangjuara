import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Users, 
  Target, 
  Trophy,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface ReportData {
  totalStudents: number;
  totalCriteria: number;
  completedAssessments: number;
  topStudent?: {
    nama: string;
    nim: string;
    score: number;
  };
}

interface Student {
  id: string;
  nama: string;
  nim: string;
  jurusan: string;
}

interface Criteria {
  id: string;
  nama: string;
  kode: string;
  bobot: number;
}

interface Result {
  student_id: string;
  total_score: number;
  ranking: number;
  student?: Student;
}

const chartConfig = {
  score: { label: "Skor", color: "hsl(var(--chart-1))" },
  count: { label: "Jumlah", color: "hsl(var(--chart-2))" },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ReportsPage = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalStudents: 0,
    totalCriteria: 0,
    completedAssessments: 0,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [studentsRes, criteriaRes, assessmentsRes, resultsRes] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('criteria').select('*'),
        supabase.from('assessments').select('*'),
        supabase.from('results').select('*').order('ranking')
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (criteriaRes.error) throw criteriaRes.error;
      if (assessmentsRes.error) throw assessmentsRes.error;
      if (resultsRes.error) throw resultsRes.error;

      const students = studentsRes.data || [];
      const criteria = criteriaRes.data || [];
      const assessments = assessmentsRes.data || [];
      const results = (resultsRes.data || []).map(result => ({
        ...result,
        student: students.find(s => s.id === result.student_id)
      }));

      setStudents(students);
      setCriteria(criteria);
      setResults(results);

      const topStudent = results.length > 0 ? {
        nama: results[0].student?.nama || 'Unknown',
        nim: results[0].student?.nim || 'Unknown',
        score: results[0].total_score
      } : undefined;

      setReportData({
        totalStudents: students.length,
        totalCriteria: criteria.length,
        completedAssessments: assessments.length,
        topStudent
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data laporan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const departmentData = students.reduce((acc, student) => {
    const dept = student.jurusan || 'Unknown';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const departmentChartData = Object.entries(departmentData).map(([dept, count]) => ({
    department: dept,
    count
  }));

  const criteriaChartData = criteria.map(criterion => ({
    name: criterion.kode,
    bobot: criterion.bobot
  }));

  const performanceData = results.slice(0, 10).map(result => ({
    nama: result.student?.nama?.substring(0, 10) + '...' || 'Unknown',
    score: result.total_score
  }));

  const pieData = departmentChartData.map((item, index) => ({
    name: item.department,
    value: item.count,
    fill: COLORS[index % COLORS.length]
  }));

  const exportFullReport = () => {
    const reportContent = [
      ['LAPORAN SISTEM PENDUKUNG KEPUTUSAN'],
      ['Mahasiswa Berprestasi'],
      [''],
      ['=== RINGKASAN ==='],
      ['Total Mahasiswa', reportData.totalStudents],
      ['Total Kriteria', reportData.totalCriteria],
      ['Total Penilaian', reportData.completedAssessments],
      [''],
      ['=== MAHASISWA TERBAIK ==='],
      ['Nama', reportData.topStudent?.nama || 'Belum ada data'],
      ['NIM', reportData.topStudent?.nim || 'Belum ada data'],
      ['Skor', reportData.topStudent?.score.toFixed(4) || 'Belum ada data'],
      [''],
      ['=== DAFTAR KRITERIA ==='],
      ['Kode', 'Nama', 'Bobot'],
      ...criteria.map(c => [c.kode, c.nama, c.bobot.toFixed(4)]),
      [''],
      ['=== HASIL RANKING ==='],
      ['Ranking', 'NIM', 'Nama', 'Jurusan', 'Skor'],
      ...results.map(r => [
        r.ranking,
        r.student?.nim || '',
        r.student?.nama || '',
        r.student?.jurusan || '',
        r.total_score.toFixed(4)
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');

    const blob = new Blob([reportContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_spk_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Berhasil",
      description: "Laporan berhasil didownload",
    });
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between print:justify-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Laporan</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Laporan lengkap sistem pendukung keputusan mahasiswa berprestasi
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto print:hidden">
          <Button variant="outline" onClick={printReport} className="gap-2 text-xs sm:text-sm">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button onClick={exportFullReport} className="gap-2 text-xs sm:text-sm">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export </span>Laporan
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Mahasiswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{reportData.totalStudents}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Kriteria</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{reportData.totalCriteria}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Penilaian</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{reportData.completedAssessments}</div>
          </CardContent>
        </Card>

        <Card className="glass-card col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Mahasiswa Terbaik</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm sm:text-lg font-bold truncate">{reportData.topStudent?.nama || 'Belum ada'}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.topStudent?.nim || 'Belum ada data'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="print:hidden grid grid-cols-2 lg:grid-cols-4 w-full">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="criteria" className="text-xs sm:text-sm">Kriteria</TabsTrigger>
          <TabsTrigger value="students" className="text-xs sm:text-sm">Mahasiswa</TabsTrigger>
          <TabsTrigger value="results" className="text-xs sm:text-sm">Hasil</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Distribusi Mahasiswa per Jurusan</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={departmentChartData}>
                      <XAxis 
                        dataKey="department" 
                        fontSize={12}
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Pie Chart Jurusan</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="criteria" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bobot Kriteria</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={criteriaChartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="bobot" fill="var(--color-score)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tabel Kriteria</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Bobot</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criteria.map(criterion => (
                      <TableRow key={criterion.id}>
                        <TableCell>{criterion.kode}</TableCell>
                        <TableCell>{criterion.nama}</TableCell>
                        <TableCell>{criterion.bobot.toFixed(4)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Mahasiswa</CardTitle>
              <CardDescription>Semua mahasiswa yang terdaftar dalam sistem</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIM</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jurusan</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>IPK</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(student => (
                    <TableRow key={student.id}>
                      <TableCell>{student.nim}</TableCell>
                      <TableCell>{student.nama}</TableCell>
                      <TableCell>{student.jurusan}</TableCell>
                      <TableCell>{(student as any).semester || '-'}</TableCell>
                      <TableCell>{(student as any).ipk || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performa Top 10</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <XAxis dataKey="nama" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="score" fill="var(--color-score)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 3 Mahasiswa Terbaik</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.slice(0, 3).map((result, index) => (
                    <div key={result.student_id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Badge className={
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          'bg-amber-600'
                        }>
                          #{index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium">{result.student?.nama}</div>
                          <div className="text-sm text-muted-foreground">
                            {result.student?.nim} - {result.student?.jurusan}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{result.total_score.toFixed(4)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ranking Lengkap</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ranking</TableHead>
                    <TableHead>NIM</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jurusan</TableHead>
                    <TableHead>Skor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map(result => (
                    <TableRow key={result.student_id}>
                      <TableCell>
                        <Badge>{result.ranking}</Badge>
                      </TableCell>
                      <TableCell>{result.student?.nim}</TableCell>
                      <TableCell>{result.student?.nama}</TableCell>
                      <TableCell>{result.student?.jurusan}</TableCell>
                      <TableCell>{result.total_score.toFixed(4)}</TableCell>
                      <TableCell>
                        <Badge variant={result.ranking <= 3 ? "default" : "secondary"}>
                          {result.ranking <= 3 ? "Terpilih" : "Tidak Terpilih"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Print Information */}
      <div className="hidden print:block mt-8 pt-4 border-t text-sm text-muted-foreground">
        <p>Laporan digenerate pada: {new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
        <p>Sistem Pendukung Keputusan - Mahasiswa Berprestasi</p>
      </div>
    </div>
  );
};

export default ReportsPage;