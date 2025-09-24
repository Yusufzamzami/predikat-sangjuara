import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calculator, Trophy, Medal, Award as AwardIcon, Download } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

interface Assessment {
  student_id: string;
  criteria_id: string;
  nilai_normalisasi: number;
}

interface Result {
  id?: string;
  student_id: string;
  total_score: number;
  ranking?: number;
  student?: Student;
}

const chartConfig = {
  score: {
    label: "Skor Total",
    color: "hsl(var(--chart-1))",
  },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ResultsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, criteriaRes, assessmentsRes, resultsRes] = await Promise.all([
        supabase.from('students').select('*').order('nama'),
        supabase.from('criteria').select('*').order('kode'),
        supabase.from('assessments').select('*'),
        supabase.from('results').select('*').order('ranking')
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (criteriaRes.error) throw criteriaRes.error;
      if (assessmentsRes.error) throw assessmentsRes.error;
      if (resultsRes.error) throw resultsRes.error;

      setStudents(studentsRes.data || []);
      setCriteria(criteriaRes.data || []);
      setAssessments(assessmentsRes.data || []);
      
      // Merge results with student data
      const resultsWithStudents = (resultsRes.data || []).map(result => ({
        ...result,
        student: studentsRes.data?.find(s => s.id === result.student_id)
      }));
      setResults(resultsWithStudents);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateResults = async () => {
    setCalculating(true);
    try {
      // Clear existing results
      await supabase.from('results').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const studentResults: { student_id: string; total_score: number }[] = [];

      // Calculate total score for each student
      for (const student of students) {
        let totalScore = 0;

        for (const criterion of criteria) {
          const assessment = assessments.find(
            a => a.student_id === student.id && a.criteria_id === criterion.id
          );

          if (assessment && assessment.nilai_normalisasi) {
            totalScore += assessment.nilai_normalisasi * criterion.bobot;
          }
        }

        studentResults.push({
          student_id: student.id,
          total_score: totalScore
        });
      }

      // Sort by total score (descending) and assign rankings
      studentResults.sort((a, b) => b.total_score - a.total_score);
      
      const resultsWithRanking = studentResults.map((result, index) => ({
        ...result,
        ranking: index + 1
      }));

      // Insert results into database
      if (resultsWithRanking.length > 0) {
        const { error } = await supabase
          .from('results')
          .insert(resultsWithRanking);

        if (error) throw error;
      }

      await fetchData();
      toast({
        title: "Berhasil",
        description: "Hasil perhitungan berhasil digenerate",
      });
    } catch (error) {
      console.error('Error calculating results:', error);
      toast({
        title: "Error",
        description: "Gagal menghitung hasil",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 hover:bg-yellow-600";
    if (rank === 2) return "bg-gray-400 hover:bg-gray-500";
    if (rank === 3) return "bg-amber-600 hover:bg-amber-700";
    return "bg-blue-500 hover:bg-blue-600";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4" />;
    if (rank === 2) return <Medal className="h-4 w-4" />;
    if (rank === 3) return <AwardIcon className="h-4 w-4" />;
    return null;
  };

  // Prepare chart data
  const chartData = results.slice(0, 10).map(result => ({
    nama: result.student?.nama?.substring(0, 15) + '...' || 'Unknown',
    score: result.total_score,
  }));

  const pieData = results.slice(0, 5).map((result, index) => ({
    name: result.student?.nama || 'Unknown',
    value: result.total_score,
    fill: COLORS[index % COLORS.length]
  }));

  const exportResults = () => {
    const csvContent = [
      ['Ranking', 'NIM', 'Nama', 'Jurusan', 'Skor Total'],
      ...results.map(result => [
        result.ranking,
        result.student?.nim || '',
        result.student?.nama || '',
        result.student?.jurusan || '',
        result.total_score.toFixed(4)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hasil_ranking_mahasiswa.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hasil & Ranking</h1>
          <p className="text-muted-foreground">
            Hasil akhir perhitungan AHP dan SAW untuk ranking mahasiswa
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={calculateResults} disabled={calculating} className="gap-2">
            <Calculator className="h-4 w-4" />
            {calculating ? 'Menghitung...' : 'Hitung Hasil'}
          </Button>
          {results.length > 0 && (
            <Button variant="outline" onClick={exportResults} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Top 3 Students */}
      {results.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {results.slice(0, 3).map((result, index) => (
            <Card key={result.id} className={`${index === 0 ? 'border-yellow-500' : index === 1 ? 'border-gray-400' : 'border-amber-600'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Peringkat {result.ranking}
                </CardTitle>
                <Badge className={getRankBadgeColor(result.ranking || 0)}>
                  {getRankIcon(result.ranking || 0)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.student?.nama}</div>
                <p className="text-xs text-muted-foreground">
                  {result.student?.nim} - {result.student?.jurusan}
                </p>
                <div className="text-lg font-semibold text-primary mt-2">
                  Skor: {result.total_score.toFixed(4)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Mahasiswa</CardTitle>
              <CardDescription>Grafik skor total mahasiswa terbaik</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="nama" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="score" fill="var(--color-score)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Distribution</CardTitle>
              <CardDescription>Distribusi skor 5 mahasiswa terbaik</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const value = payload[0].value;
                        const numValue = typeof value === 'number' ? value : parseFloat(value as string);
                        return (
                          <div className="bg-white p-2 border rounded shadow">
                            <p>{payload[0].payload.name}</p>
                            <p>Skor: {numValue.toFixed(4)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tabel Ranking Lengkap</CardTitle>
          <CardDescription>
            Semua mahasiswa diurutkan berdasarkan skor total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Ranking</TableHead>
                <TableHead>NIM</TableHead>
                <TableHead>Nama Mahasiswa</TableHead>
                <TableHead>Jurusan</TableHead>
                <TableHead className="text-right">Skor Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={getRankBadgeColor(result.ranking || 0)}>
                        {result.ranking}
                      </Badge>
                      {getRankIcon(result.ranking || 0)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {result.student?.nim}
                  </TableCell>
                  <TableCell>{result.student?.nama}</TableCell>
                  <TableCell>{result.student?.jurusan}</TableCell>
                  <TableCell className="text-right font-mono">
                    {result.total_score.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={result.ranking && result.ranking <= 3 ? "default" : "secondary"}>
                      {result.ranking && result.ranking <= 3 ? "Terpilih" : "Tidak Terpilih"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada hasil perhitungan. Klik "Hitung Hasil" untuk memulai perhitungan.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsPage;