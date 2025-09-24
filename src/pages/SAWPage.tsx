import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calculator, Save, Plus, Trash2 } from 'lucide-react';

interface Student {
  id: string;
  nama: string;
  nim: string;
}

interface Criteria {
  id: string;
  nama: string;
  kode: string;
  bobot: number;
  jenis: string; // benefit or cost
}

interface Assessment {
  id?: string;
  student_id: string;
  criteria_id: string;
  nilai: number;
  nilai_normalisasi: number;
}

const SAWPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedCriterion, setSelectedCriterion] = useState<string>('');
  const [nilai, setNilai] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, criteriaRes, assessmentsRes] = await Promise.all([
        supabase.from('students').select('id, nama, nim').order('nama'),
        supabase.from('criteria').select('*').order('kode'),
        supabase.from('assessments').select('*')
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (criteriaRes.error) throw criteriaRes.error;
      if (assessmentsRes.error) throw assessmentsRes.error;

      setStudents(studentsRes.data || []);
      setCriteria(criteriaRes.data || []);
      setAssessments(assessmentsRes.data || []);
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

  const addAssessment = async () => {
    if (!selectedStudent || !selectedCriterion || !nilai) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('assessments')
        .insert({
          student_id: selectedStudent,
          criteria_id: selectedCriterion,
          nilai: parseFloat(nilai)
        });

      if (error) throw error;

      setSelectedStudent('');
      setSelectedCriterion('');
      setNilai('');
      await fetchData();

      toast({
        title: "Berhasil",
        description: "Penilaian berhasil ditambahkan",
      });
    } catch (error) {
      console.error('Error adding assessment:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan penilaian",
        variant: "destructive",
      });
    }
  };

  const deleteAssessment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchData();
      toast({
        title: "Berhasil",
        description: "Penilaian berhasil dihapus",
      });
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus penilaian",
        variant: "destructive",
      });
    }
  };

  const calculateNormalization = async () => {
    setCalculating(true);
    try {
      // Group assessments by criteria
      const assessmentsByCriteria = criteria.reduce((acc, criterion) => {
        acc[criterion.id] = assessments.filter(a => a.criteria_id === criterion.id);
        return acc;
      }, {} as Record<string, Assessment[]>);

      // Calculate normalization for each criterion
      const normalizedAssessments: Assessment[] = [];

      for (const criterion of criteria) {
        const criterionAssessments = assessmentsByCriteria[criterion.id] || [];
        
        if (criterionAssessments.length === 0) continue;

        const values = criterionAssessments.map(a => a.nilai);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);

        for (const assessment of criterionAssessments) {
          let normalizedValue: number;
          
          if (criterion.jenis === 'benefit') {
            // For benefit criteria: higher is better
            normalizedValue = assessment.nilai / maxValue;
          } else {
            // For cost criteria: lower is better
            normalizedValue = minValue / assessment.nilai;
          }

          normalizedAssessments.push({
            ...assessment,
            nilai_normalisasi: normalizedValue
          });
        }
      }

      // Update normalized values in database
      for (const assessment of normalizedAssessments) {
        const { error } = await supabase
          .from('assessments')
          .update({ nilai_normalisasi: assessment.nilai_normalisasi })
          .eq('id', assessment.id);

        if (error) throw error;
      }

      await fetchData();
      toast({
        title: "Berhasil",
        description: "Normalisasi berhasil dihitung",
      });
    } catch (error) {
      console.error('Error calculating normalization:', error);
      toast({
        title: "Error",
        description: "Gagal menghitung normalisasi",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const getAssessmentValue = (studentId: string, criteriaId: string, type: 'nilai' | 'normalisasi'): string => {
    const assessment = assessments.find(a => a.student_id === studentId && a.criteria_id === criteriaId);
    if (!assessment) return '-';
    
    const value = type === 'nilai' ? assessment.nilai : assessment.nilai_normalisasi;
    return value ? value.toFixed(4) : '-';
  };

  const getStudentName = (studentId: string): string => {
    const student = students.find(s => s.id === studentId);
    return student ? student.nama : 'Unknown';
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
          <h1 className="text-3xl font-bold tracking-tight">Perhitungan SAW</h1>
          <p className="text-muted-foreground">
            Simple Additive Weighting untuk penilaian mahasiswa
          </p>
        </div>
        <Button onClick={calculateNormalization} disabled={calculating} className="gap-2">
          <Calculator className="h-4 w-4" />
          Hitung Normalisasi
        </Button>
      </div>

      {/* Add Assessment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Tambah Penilaian</CardTitle>
          <CardDescription>
            Masukkan nilai penilaian untuk setiap kriteria dan mahasiswa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Mahasiswa</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mahasiswa" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.nim} - {student.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Kriteria</label>
              <Select value={selectedCriterion} onValueChange={setSelectedCriterion}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kriteria" />
                </SelectTrigger>
                <SelectContent>
                  {criteria.map(criterion => (
                    <SelectItem key={criterion.id} value={criterion.id}>
                      {criterion.kode} - {criterion.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Nilai</label>
              <Input
                type="number"
                placeholder="Masukkan nilai"
                value={nilai}
                onChange={(e) => setNilai(e.target.value)}
                step="0.01"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addAssessment} className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Matrik Penilaian</CardTitle>
          <CardDescription>
            Nilai asli dari setiap mahasiswa untuk setiap kriteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mahasiswa</TableHead>
                {criteria.map(criterion => (
                  <TableHead key={criterion.id} className="text-center">
                    {criterion.kode}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      ({criterion.jenis === 'benefit' ? 'Benefit' : 'Cost'})
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.nim} - {student.nama}
                  </TableCell>
                  {criteria.map(criterion => (
                    <TableCell key={criterion.id} className="text-center">
                      {getAssessmentValue(student.id, criterion.id, 'nilai')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Normalized Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Matrik Normalisasi</CardTitle>
          <CardDescription>
            Nilai yang telah dinormalisasi untuk setiap kriteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mahasiswa</TableHead>
                {criteria.map(criterion => (
                  <TableHead key={criterion.id} className="text-center">
                    {criterion.kode}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Bobot: {criterion.bobot.toFixed(4)}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.nim} - {student.nama}
                  </TableCell>
                  {criteria.map(criterion => (
                    <TableCell key={criterion.id} className="text-center">
                      {getAssessmentValue(student.id, criterion.id, 'normalisasi')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assessment List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Penilaian</CardTitle>
          <CardDescription>
            Semua penilaian yang telah dimasukkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mahasiswa</TableHead>
                <TableHead>Kriteria</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Nilai Normalisasi</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map(assessment => (
                <TableRow key={assessment.id}>
                  <TableCell>{getStudentName(assessment.student_id)}</TableCell>
                  <TableCell>
                    {criteria.find(c => c.id === assessment.criteria_id)?.nama || 'Unknown'}
                  </TableCell>
                  <TableCell>{assessment.nilai}</TableCell>
                  <TableCell>{assessment.nilai_normalisasi?.toFixed(4) || '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => assessment.id && deleteAssessment(assessment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SAWPage;