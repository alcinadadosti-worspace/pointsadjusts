-- Criação do ENUM de motivos
CREATE TYPE reason_enum AS ENUM (
  'ESQUECIMENTO',
  'SISTEMA_INDISPONIVEL',
  'COMPENSACAO_DE_HORAS',
  'ATESTADO_MEDICO',
  'AJUSTE'
);

-- Tabela de Colaboradores
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id text NULL,
  manager_name text NOT NULL,
  manager_email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de Ajustes
CREATE TABLE adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  manager_name text NOT NULL,
  manager_email text NOT NULL,
  date date NOT NULL,
  entry_time time NOT NULL,
  break_out_time time NULL,
  break_in_time time NULL,
  exit_time time NOT NULL,
  reason reason_enum NOT NULL,
  note text NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjustments ENABLE ROW LEVEL SECURITY;

-- Policies para Employees
CREATE POLICY "Managers can select their own employees"
ON employees FOR SELECT
USING (manager_email = auth.jwt()->>'email');

CREATE POLICY "Managers can insert their own employees"
ON employees FOR INSERT
WITH CHECK (manager_email = auth.jwt()->>'email');

-- Policies para Adjustments
CREATE POLICY "Managers can select adjustments for their team"
ON adjustments FOR SELECT
USING (manager_email = auth.jwt()->>'email');

CREATE POLICY "Managers can insert adjustments for their team"
ON adjustments FOR INSERT
WITH CHECK (manager_email = auth.jwt()->>'email');

CREATE POLICY "Managers can delete adjustments for their team"
ON adjustments FOR DELETE
USING (manager_email = auth.jwt()->>'email');