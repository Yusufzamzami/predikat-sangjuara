import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';

interface Criteria {
  id: string;
  kode: string;
  nama: string;
  bobot: number;
  jenis: 'benefit' | 'cost';
  deskripsi: string | null;
}

const CriteriaPage = () => {
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<Criteria | null>(null);
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    bobot: '',
    jenis: 'benefit' as 'benefit' | 'cost',
    deskripsi: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCriteria();
  }, []);

  const fetchCriteria = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('criteria')
        .select('*')
        .order('kode');

      if (error) throw error;
      setCriteria((data || []) as Criteria[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data kriteria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      kode: '',
      nama: '',
      bobot: '',
      jenis: 'benefit',
      deskripsi: '',
    });
    setEditingCriteria(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const criteriaData = {
      kode: formData.kode,
      nama: formData.nama,
      bobot: parseFloat(formData.bobot),
      jenis: formData.jenis,
      deskripsi: formData.deskripsi || null,
    };

    try {
      if (editingCriteria) {
        const { error } = await supabase
          .from('criteria')
          .update(criteriaData)
          .eq('id', editingCriteria.id);
        
        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Kriteria berhasil diperbarui",
        });
      } else {
        const { error } = await supabase
          .from('criteria')
          .insert(criteriaData);
        
        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Kriteria berhasil ditambahkan",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCriteria();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "Kode kriteria sudah digunakan"
          : "Gagal menyimpan kriteria",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (criteria: Criteria) => {
    setEditingCriteria(criteria);
    setFormData({
      kode: criteria.kode,
      nama: criteria.nama,
      bobot: criteria.bobot.toString(),
      jenis: criteria.jenis,
      deskripsi: criteria.deskripsi || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kriteria ini?')) return;

    try {
      const { error } = await supabase
        .from('criteria')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Kriteria berhasil dihapus",
      });
      fetchCriteria();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menghapus kriteria",
        variant: "destructive",
      });
    }
  };

  const totalBobot = criteria.reduce((sum, c) => sum + c.bobot, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-primary animate-float" />
            <h1 className="text-3xl font-bold gradient-text">Kriteria Penilaian</h1>
          </div>
          <p className="text-muted-foreground">Kelola kriteria dan bobot untuk penilaian mahasiswa</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="futuristic" size="lg" className="glow-on-hover">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kriteria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCriteria ? 'Edit Kriteria' : 'Tambah Kriteria Baru'}
              </DialogTitle>
              <DialogDescription>
                Lengkapi form berikut untuk {editingCriteria ? 'memperbarui' : 'menambahkan'} kriteria penilaian
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kode">Kode Kriteria</Label>
                  <Input
                    id="kode"
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                    placeholder="C1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bobot">Bobot</Label>
                  <Input
                    id="bobot"
                    type="number"
                    step="0.0001"
                    min="0"
                    max="1"
                    value={formData.bobot}
                    onChange={(e) => setFormData({ ...formData, bobot: e.target.value })}
                    placeholder="0.3000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama">Nama Kriteria</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="IPK (Indeks Prestasi Kumulatif)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jenis">Jenis Kriteria</Label>
                <Select value={formData.jenis} onValueChange={(value) => setFormData({ ...formData, jenis: value as 'benefit' | 'cost' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="benefit">Benefit (Semakin besar semakin baik)</SelectItem>
                    <SelectItem value="cost">Cost (Semakin kecil semakin baik)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Deskripsi kriteria penilaian..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="neon" className="glow-on-hover">
                  {editingCriteria ? 'Update' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-scale glow-on-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kriteria</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground animate-float" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">{criteria.length}</div>
            <p className="text-xs text-muted-foreground">
              Kriteria terdaftar
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale glow-on-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bobot</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground animate-float delay-100" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${Math.abs(totalBobot - 1) < 0.0001 ? 'text-success animate-glow-pulse' : 'text-warning animate-glow-pulse'}`}>
              {totalBobot.toFixed(4)}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.abs(totalBobot - 1) < 0.0001 ? 'Bobot seimbang' : 'Bobot harus = 1.0000'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale glow-on-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground animate-float delay-200" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${criteria.length > 0 && Math.abs(totalBobot - 1) < 0.0001 ? 'text-success animate-glow-pulse' : 'text-warning animate-glow-pulse'}`}>
              {criteria.length > 0 && Math.abs(totalBobot - 1) < 0.0001 ? 'Siap' : 'Belum Siap'}
            </div>
            <p className="text-xs text-muted-foreground">
              Status untuk penilaian
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="gradient-text">Daftar Kriteria</CardTitle>
          <CardDescription>
            Kriteria yang digunakan untuk penilaian mahasiswa berprestasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Kriteria</TableHead>
                  <TableHead>Bobot</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : criteria.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Belum ada kriteria
                    </TableCell>
                  </TableRow>
                ) : (
                  criteria.map((criteria) => (
                    <TableRow key={criteria.id}>
                      <TableCell className="font-medium">{criteria.kode}</TableCell>
                      <TableCell>{criteria.nama}</TableCell>
                      <TableCell>{criteria.bobot.toFixed(4)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          criteria.jenis === 'benefit' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {criteria.jenis === 'benefit' ? 'Benefit' : 'Cost'}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {criteria.deskripsi || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="glass"
                            size="sm"
                            className="hover-scale"
                            onClick={() => handleEdit(criteria)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover-scale hover:border-destructive hover:text-destructive"
                            onClick={() => handleDelete(criteria.id)}
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

export default CriteriaPage;