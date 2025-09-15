import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';

interface Student {
  id: string;
  nim: string;
  nama: string;
  jurusan: string;
  ipk: number;
  prestasi_non_akademik: string | null;
  keaktifan_organisasi: string | null;
  semester: number;
  tahun_masuk: number;
}

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    nim: '',
    nama: '',
    jurusan: '',
    ipk: '',
    prestasi_non_akademik: '',
    keaktifan_organisasi: '',
    semester: '',
    tahun_masuk: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('nama');

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data mahasiswa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nim: '',
      nama: '',
      jurusan: '',
      ipk: '',
      prestasi_non_akademik: '',
      keaktifan_organisasi: '',
      semester: '',
      tahun_masuk: '',
    });
    setEditingStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentData = {
      nim: formData.nim,
      nama: formData.nama,
      jurusan: formData.jurusan,
      ipk: parseFloat(formData.ipk),
      prestasi_non_akademik: formData.prestasi_non_akademik || null,
      keaktifan_organisasi: formData.keaktifan_organisasi || null,
      semester: parseInt(formData.semester),
      tahun_masuk: parseInt(formData.tahun_masuk),
    };

    try {
      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', editingStudent.id);
        
        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Data mahasiswa berhasil diperbarui",
        });
      } else {
        const { error } = await supabase
          .from('students')
          .insert(studentData);
        
        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Data mahasiswa berhasil ditambahkan",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "NIM sudah terdaftar"
          : "Gagal menyimpan data mahasiswa",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nim: student.nim,
      nama: student.nama,
      jurusan: student.jurusan,
      ipk: student.ipk.toString(),
      prestasi_non_akademik: student.prestasi_non_akademik || '',
      keaktifan_organisasi: student.keaktifan_organisasi || '',
      semester: student.semester.toString(),
      tahun_masuk: student.tahun_masuk.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data mahasiswa ini?')) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data mahasiswa berhasil dihapus",
      });
      fetchStudents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menghapus data mahasiswa",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.jurusan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Mahasiswa</h1>
          <p className="text-muted-foreground">Kelola data mahasiswa untuk penilaian prestasi</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Mahasiswa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? 'Edit Mahasiswa' : 'Tambah Mahasiswa Baru'}
              </DialogTitle>
              <DialogDescription>
                Lengkapi form berikut untuk {editingStudent ? 'memperbarui' : 'menambahkan'} data mahasiswa
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nim">NIM</Label>
                  <Input
                    id="nim"
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    placeholder="20210001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Nama Mahasiswa"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jurusan">Jurusan</Label>
                  <Input
                    id="jurusan"
                    value={formData.jurusan}
                    onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                    placeholder="Teknik Informatika"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ipk">IPK</Label>
                  <Input
                    id="ipk"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={formData.ipk}
                    onChange={(e) => setFormData({ ...formData, ipk: e.target.value })}
                    placeholder="3.85"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    type="number"
                    min="1"
                    max="14"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    placeholder="6"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tahun_masuk">Tahun Masuk</Label>
                  <Input
                    id="tahun_masuk"
                    type="number"
                    min="2015"
                    max="2030"
                    value={formData.tahun_masuk}
                    onChange={(e) => setFormData({ ...formData, tahun_masuk: e.target.value })}
                    placeholder="2021"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prestasi_non_akademik">Prestasi Non-Akademik</Label>
                <Textarea
                  id="prestasi_non_akademik"
                  value={formData.prestasi_non_akademik}
                  onChange={(e) => setFormData({ ...formData, prestasi_non_akademik: e.target.value })}
                  placeholder="Juara 1 Lomba Programming, Medali Emas Olimpiade Sains..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keaktifan_organisasi">Keaktifan Organisasi</Label>
                <Textarea
                  id="keaktifan_organisasi"
                  value={formData.keaktifan_organisasi}
                  onChange={(e) => setFormData({ ...formData, keaktifan_organisasi: e.target.value })}
                  placeholder="Ketua HMTI, Bendahara BEM, Anggota UKM..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingStudent ? 'Update' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Mahasiswa</CardTitle>
          <CardDescription>
            Total: {students.length} mahasiswa terdaftar
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari mahasiswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIM</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jurusan</TableHead>
                  <TableHead>IPK</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Tahun Masuk</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Tidak ada mahasiswa yang cocok dengan pencarian' : 'Belum ada data mahasiswa'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.nim}</TableCell>
                      <TableCell>{student.nama}</TableCell>
                      <TableCell>{student.jurusan}</TableCell>
                      <TableCell>{student.ipk.toFixed(2)}</TableCell>
                      <TableCell>{student.semester}</TableCell>
                      <TableCell>{student.tahun_masuk}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsPage;