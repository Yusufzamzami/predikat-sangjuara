-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nim TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  jurusan TEXT NOT NULL,
  ipk DECIMAL(3,2) NOT NULL CHECK (ipk >= 0.00 AND ipk <= 4.00),
  prestasi_non_akademik TEXT,
  keaktifan_organisasi TEXT,
  semester INTEGER NOT NULL,
  tahun_masuk INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create policies for students (admin only)
CREATE POLICY "Authenticated users can manage students" 
ON public.students 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create criteria table for assessment criteria
CREATE TABLE public.criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kode TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  bobot DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
  jenis TEXT NOT NULL CHECK (jenis IN ('benefit', 'cost')),
  deskripsi TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for criteria
ALTER TABLE public.criteria ENABLE ROW LEVEL SECURITY;

-- Create policies for criteria
CREATE POLICY "Authenticated users can manage criteria" 
ON public.criteria 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create assessments table for student scores
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  criteria_id UUID NOT NULL REFERENCES public.criteria(id) ON DELETE CASCADE,
  nilai DECIMAL(8,4) NOT NULL,
  nilai_normalisasi DECIMAL(8,4) DEFAULT 0.0000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, criteria_id)
);

-- Enable RLS for assessments
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for assessments
CREATE POLICY "Authenticated users can manage assessments" 
ON public.assessments 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create AHP comparisons table for pairwise comparisons
CREATE TABLE public.ahp_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  criteria_a_id UUID NOT NULL REFERENCES public.criteria(id) ON DELETE CASCADE,
  criteria_b_id UUID NOT NULL REFERENCES public.criteria(id) ON DELETE CASCADE,
  nilai_perbandingan DECIMAL(8,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(criteria_a_id, criteria_b_id)
);

-- Enable RLS for AHP comparisons
ALTER TABLE public.ahp_comparisons ENABLE ROW LEVEL SECURITY;

-- Create policies for AHP comparisons
CREATE POLICY "Authenticated users can manage AHP comparisons" 
ON public.ahp_comparisons 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create results table for final SAW scores
CREATE TABLE public.results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  total_score DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
  ranking INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Enable RLS for results
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Create policies for results
CREATE POLICY "Authenticated users can manage results" 
ON public.results 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_criteria_updated_at
BEFORE UPDATE ON public.criteria
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at
BEFORE UPDATE ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ahp_comparisons_updated_at
BEFORE UPDATE ON public.ahp_comparisons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_results_updated_at
BEFORE UPDATE ON public.results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Admin User'),
    'admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Insert sample criteria
INSERT INTO public.criteria (kode, nama, bobot, jenis, deskripsi) VALUES
('C1', 'IPK (Indeks Prestasi Kumulatif)', 0.3000, 'benefit', 'Nilai IPK mahasiswa dengan skala 0.00 - 4.00'),
('C2', 'Prestasi Non-Akademik', 0.2500, 'benefit', 'Prestasi di bidang olahraga, seni, atau kompetisi lainnya'),
('C3', 'Keaktifan Organisasi', 0.2000, 'benefit', 'Partisipasi dan kontribusi dalam organisasi kemahasiswaan'),
('C4', 'Publikasi Ilmiah', 0.1500, 'benefit', 'Karya ilmiah yang dipublikasikan di jurnal atau konferensi'),
('C5', 'Pengalaman Kepemimpinan', 0.1000, 'benefit', 'Pengalaman memimpin organisasi atau kegiatan');

-- Insert sample students
INSERT INTO public.students (nim, nama, jurusan, ipk, prestasi_non_akademik, keaktifan_organisasi, semester, tahun_masuk) VALUES
('2021001', 'Ahmad Rifai', 'Teknik Informatika', 3.85, 'Juara 1 Lomba Programming', 'Ketua HMTI', 6, 2021),
('2021002', 'Siti Nurhaliza', 'Sistem Informasi', 3.92, 'Juara 2 Lomba Design UI/UX', 'Bendahara BEM', 6, 2021),
('2021003', 'Budi Santoso', 'Teknik Elektro', 3.78, 'Juara 3 Lomba Robot', 'Anggota HIMATEKRO', 6, 2021),
('2021004', 'Dewi Sartika', 'Manajemen', 3.88, 'Juara 1 Business Plan', 'Wakil Ketua HIMMAN', 6, 2021),
('2021005', 'Eko Prasetyo', 'Akuntansi', 3.81, 'Sertifikat Brevet Pajak', 'Sekretaris HIMAKUNT', 6, 2021);