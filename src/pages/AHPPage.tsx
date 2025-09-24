import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calculator, Save, RefreshCw } from 'lucide-react';

interface Criteria {
  id: string;
  nama: string;
  kode: string;
  bobot: number;
}

interface Comparison {
  id?: string;
  criteria_a_id: string;
  criteria_b_id: string;
  nilai_perbandingan: number;
}

const AHPPage = () => {
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCriteria();
    fetchComparisons();
  }, []);

  const fetchCriteria = async () => {
    try {
      const { data, error } = await supabase
        .from('criteria')
        .select('*')
        .order('kode');
      
      if (error) throw error;
      setCriteria(data || []);
    } catch (error) {
      console.error('Error fetching criteria:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data kriteria",
        variant: "destructive",
      });
    }
  };

  const fetchComparisons = async () => {
    try {
      const { data, error } = await supabase
        .from('ahp_comparisons')
        .select('*');
      
      if (error) throw error;
      setComparisons(data || []);
    } catch (error) {
      console.error('Error fetching comparisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComparisonValue = (criteriaA: string, criteriaB: string): number => {
    if (criteriaA === criteriaB) return 1;
    
    const comparison = comparisons.find(
      c => (c.criteria_a_id === criteriaA && c.criteria_b_id === criteriaB)
    );
    
    if (comparison) return comparison.nilai_perbandingan;
    
    const reverseComparison = comparisons.find(
      c => (c.criteria_a_id === criteriaB && c.criteria_b_id === criteriaA)
    );
    
    return reverseComparison ? 1 / reverseComparison.nilai_perbandingan : 1;
  };

  const updateComparison = async (criteriaA: string, criteriaB: string, value: number) => {
    try {
      const existingComparison = comparisons.find(
        c => (c.criteria_a_id === criteriaA && c.criteria_b_id === criteriaB) ||
             (c.criteria_a_id === criteriaB && c.criteria_b_id === criteriaA)
      );

      if (existingComparison) {
        const { error } = await supabase
          .from('ahp_comparisons')
          .update({
            criteria_a_id: criteriaA,
            criteria_b_id: criteriaB,
            nilai_perbandingan: value
          })
          .eq('id', existingComparison.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ahp_comparisons')
          .insert({
            criteria_a_id: criteriaA,
            criteria_b_id: criteriaB,
            nilai_perbandingan: value
          });
        
        if (error) throw error;
      }

      await fetchComparisons();
      toast({
        title: "Berhasil",
        description: "Perbandingan berhasil disimpan",
      });
    } catch (error) {
      console.error('Error updating comparison:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan perbandingan",
        variant: "destructive",
      });
    }
  };

  const calculateWeights = async () => {
    setCalculating(true);
    try {
      // Create comparison matrix
      const matrix = criteria.map(rowCriteria =>
        criteria.map(colCriteria => getComparisonValue(rowCriteria.id, colCriteria.id))
      );

      // Calculate column sums
      const colSums = matrix[0].map((_, colIndex) =>
        matrix.reduce((sum, row) => sum + row[colIndex], 0)
      );

      // Normalize matrix
      const normalizedMatrix = matrix.map(row =>
        row.map((value, colIndex) => value / colSums[colIndex])
      );

      // Calculate weights (average of each row)
      const weights = normalizedMatrix.map(row =>
        row.reduce((sum, value) => sum + value, 0) / row.length
      );

      // Update criteria weights in database
      for (let i = 0; i < criteria.length; i++) {
        const { error } = await supabase
          .from('criteria')
          .update({ bobot: weights[i] })
          .eq('id', criteria[i].id);
        
        if (error) throw error;
      }

      await fetchCriteria();
      toast({
        title: "Berhasil",
        description: "Bobot kriteria berhasil dihitung dan disimpan",
      });
    } catch (error) {
      console.error('Error calculating weights:', error);
      toast({
        title: "Error",
        description: "Gagal menghitung bobot kriteria",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Penilaian AHP</h1>
          <p className="text-muted-foreground">
            Analytic Hierarchy Process untuk menentukan bobot kriteria
          </p>
        </div>
        <Button onClick={calculateWeights} disabled={calculating} className="gap-2">
          {calculating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Menghitung...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4" />
              Hitung Bobot
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matrik Perbandingan Berpasangan</CardTitle>
          <CardDescription>
            Masukkan nilai perbandingan antar kriteria (1-9)
            <br />
            1 = Sama penting, 3 = Sedikit lebih penting, 5 = Lebih penting, 7 = Sangat penting, 9 = Mutlak lebih penting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kriteria</TableHead>
                {criteria.map(criterion => (
                  <TableHead key={criterion.id} className="text-center">
                    {criterion.kode}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {criteria.map((rowCriterion, rowIndex) => (
                <TableRow key={rowCriterion.id}>
                  <TableCell className="font-medium">
                    {rowCriterion.kode} - {rowCriterion.nama}
                  </TableCell>
                  {criteria.map((colCriterion, colIndex) => (
                    <TableCell key={colCriterion.id} className="text-center">
                      {rowIndex === colIndex ? (
                        <span className="text-muted-foreground">1</span>
                      ) : rowIndex < colIndex ? (
                        <Input
                          type="number"
                          min="0.111"
                          max="9"
                          step="0.001"
                          value={getComparisonValue(rowCriterion.id, colCriterion.id)}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 1;
                            updateComparison(rowCriterion.id, colCriterion.id, value);
                          }}
                          className="w-20 text-center"
                        />
                      ) : (
                        <span className="text-muted-foreground">
                          {(1 / getComparisonValue(colCriterion.id, rowCriterion.id)).toFixed(3)}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bobot Kriteria</CardTitle>
          <CardDescription>
            Hasil perhitungan bobot dari matrik perbandingan berpasangan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Kriteria</TableHead>
                <TableHead>Bobot</TableHead>
                <TableHead>Persentase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {criteria.map(criterion => (
                <TableRow key={criterion.id}>
                  <TableCell className="font-medium">{criterion.kode}</TableCell>
                  <TableCell>{criterion.nama}</TableCell>
                  <TableCell>{criterion.bobot.toFixed(4)}</TableCell>
                  <TableCell>{(criterion.bobot * 100).toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AHPPage;