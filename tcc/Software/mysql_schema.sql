-- ============================================================
-- MODELO MYSQL - SISTEMA DE GERENCIAMENTO DE ESTOQUE
-- ============================================================
-- Este arquivo define a estrutura do banco externo utilizado pelo
-- software. Ele deve ser aplicado pelo administrador do banco (MySQL 8+).
-- Senhas devem ser gravadas somente como hash gerado no backend.
-- O campo "id" de cada tabela substitui o id numérico do objetos.json.

-- ============================================================
-- 1. BANCO E CONFIGURAÇÕES GERAIS
-- ============================================================
-- Cria o banco sem apagar dados existentes.
CREATE DATABASE IF NOT EXISTS tcc_estoque
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tcc_estoque;

-- ============================================================
-- 2. USUÁRIOS, LOGIN E PERFIL
-- ============================================================
-- Atende cadastro, login e edição de perfil.
-- email pode ser preenchido posteriormente pelo perfil porque o
-- formulário de cadastro solicita nome, e-mail e senha.
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(80) NOT NULL,
  email VARCHAR(100) NULL,
  senha_hash VARCHAR(255) NOT NULL,
  data_nascimento DATE NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  ultimo_login DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email),
  KEY idx_usuarios_nome (nome),
  CONSTRAINT chk_usuarios_ativo CHECK (ativo IN (0, 1))
) ENGINE=InnoDB;

-- ============================================================
-- 3. CLIENTES
-- ============================================================
-- Dados exibidos na lista de clientes e usados como referência
-- para locações: nome, telefone, tipo e CPF/CNPJ.
CREATE TABLE IF NOT EXISTS clientes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  telefone VARCHAR(30) NOT NULL,
  tipo_cliente VARCHAR(80) NOT NULL,
  cpf_cnpj VARCHAR(20) NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clientes_cpf_cnpj (cpf_cnpj),
  KEY idx_clientes_nome (nome),
  KEY idx_clientes_tipo (tipo_cliente)
) ENGINE=InnoDB;

-- ============================================================
-- 4. VEÍCULOS
-- ============================================================
-- Dados exibidos na lista de veículos e utilizados para identificar
-- o veículo relacionado a uma locação.
-- Os catálogos abaixo reproduzem as entidades "marca" e "modelo" do
-- modelo lógico. Eles são opcionais porque o código atual recebe marca
-- e modelo diretamente como texto.
CREATE TABLE IF NOT EXISTS marcas_veiculo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  descricao VARCHAR(80) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_marcas_veiculo_descricao (descricao)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS modelos_veiculo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  descricao VARCHAR(100) NOT NULL,
  marca_id BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_modelos_veiculo_descricao_marca (descricao, marca_id),
  CONSTRAINT fk_modelos_veiculo_marca
    FOREIGN KEY (marca_id) REFERENCES marcas_veiculo (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS veiculos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  placa VARCHAR(10) NOT NULL,
  marca VARCHAR(80) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  marca_id BIGINT UNSIGNED NULL,
  modelo_id BIGINT UNSIGNED NULL,
  ano SMALLINT UNSIGNED NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_veiculos_placa (placa),
  KEY idx_veiculos_marca_modelo (marca, modelo),
  KEY idx_veiculos_marca_id (marca_id),
  KEY idx_veiculos_modelo_id (modelo_id),
  CONSTRAINT fk_veiculos_marca
    FOREIGN KEY (marca_id) REFERENCES marcas_veiculo (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_veiculos_modelo
    FOREIGN KEY (modelo_id) REFERENCES modelos_veiculo (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT chk_veiculos_ano CHECK (ano BETWEEN 1900 AND 2100)
) ENGINE=InnoDB;

-- ============================================================
-- 4.1. RELAÇÃO CLIENTE -> VEÍCULO (POSSUI)
-- ============================================================
-- Representa a relação "possui" do modelo lógico. Ela é opcional:
-- um veículo pode ainda não ter cliente associado. A tabela própria
-- também permite manter a relação separada dos dados do veículo.
CREATE TABLE IF NOT EXISTS clientes_veiculos (
  cliente_id BIGINT UNSIGNED NOT NULL,
  veiculo_id BIGINT UNSIGNED NOT NULL,
  inicio_posse DATE NULL,
  fim_posse DATE NULL,
  PRIMARY KEY (cliente_id, veiculo_id),
  UNIQUE KEY uq_clientes_veiculos_veiculo (veiculo_id),
  CONSTRAINT fk_clientes_veiculos_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_clientes_veiculos_veiculo
    FOREIGN KEY (veiculo_id) REFERENCES veiculos (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_clientes_veiculos_periodo CHECK (
    fim_posse IS NULL OR inicio_posse IS NULL OR fim_posse >= inicio_posse
  )
) ENGINE=InnoDB;

-- ============================================================
-- 5. OPÇÕES DINÂMICAS DE EQUIPAMENTOS E ACESSÓRIOS
-- ============================================================
-- Substitui equipamento-opcoes.json. A coluna grupo permite que
-- modelos de acessórios sejam filtrados por tipo (Bloqueador, Leitor etc.).
CREATE TABLE IF NOT EXISTS opcoes_catalogo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  categoria ENUM(
    'tecnologia',
    'modelo_equipamento',
    'tipo_acessorio',
    'modelo_acessorio'
  ) NOT NULL,
  valor VARCHAR(120) NOT NULL,
  grupo VARCHAR(80) NOT NULL DEFAULT '',
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_opcoes_catalogo (categoria, valor, grupo),
  KEY idx_opcoes_catalogo_busca (categoria, grupo, ativo),
  CONSTRAINT chk_opcoes_ativas CHECK (ativo IN (0, 1))
) ENGINE=InnoDB;

-- ============================================================
-- 6. EQUIPAMENTOS
-- ============================================================
-- Atende cadastro, edição, remoção, busca e filtros por número de
-- série, tecnologia, modelo, ano de aquisição e status.
-- modelos_equipamento representa a entidade do modelo lógico, enquanto
-- equipamentos.modelo continua textual para preservar o formulário atual.
CREATE TABLE IF NOT EXISTS modelos_equipamento (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  descricao VARCHAR(120) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_modelos_equipamento_descricao (descricao)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS equipamentos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  numero_serie VARCHAR(120) NOT NULL,
  tecnologia VARCHAR(120) NOT NULL,
  modelo VARCHAR(120) NOT NULL,
  modelo_id BIGINT UNSIGNED NULL,
  ano_aquisicao SMALLINT UNSIGNED NOT NULL,
  status ENUM('Locado', 'Disponível', 'Em Manutenção')
    NOT NULL DEFAULT 'Disponível',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_equipamentos_numero_serie (numero_serie),
  KEY idx_equipamentos_filtros (tecnologia, modelo, status),
  KEY idx_equipamentos_modelo_id (modelo_id),
  CONSTRAINT fk_equipamentos_modelo
    FOREIGN KEY (modelo_id) REFERENCES modelos_equipamento (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT chk_equipamentos_ano CHECK (ano_aquisicao BETWEEN 1900 AND 2100)
) ENGINE=InnoDB;

-- ============================================================
-- 7. ACESSÓRIOS
-- ============================================================
-- Atende cadastro, edição, remoção e filtros por tipo, modelo e status.
CREATE TABLE IF NOT EXISTS acessorios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipo_acessorio VARCHAR(80) NOT NULL,
  modelo VARCHAR(120) NOT NULL,
  status ENUM('Locado', 'Disponível', 'Em Manutenção')
    NOT NULL DEFAULT 'Disponível',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_acessorios_filtros (tipo_acessorio, modelo, status)
) ENGINE=InnoDB;

-- ============================================================
-- 8. RELAÇÃO EQUIPAMENTO <-> VEÍCULO (POSSUI / INSTALAÇÃO)
-- ============================================================
-- Corrige a relação "possui" do modelo lógico: os campos são chaves
-- estrangeiras, e não números soltos. A relação é 0..1 para cada lado,
-- conforme o diagrama: um equipamento pode estar ligado a um veículo e
-- um veículo pode ter um equipamento principal.
--
-- Os nomes de marca, modelo, placa, tecnologia e número de série ficam
-- como texto porque essa é a estrutura usada pelo código atual.
-- garantia, data_retirada e data_instalacao preservam os dados do
-- modelo lógico e permitem consultar a instalação atual.
CREATE TABLE IF NOT EXISTS equipamentos_veiculos (
  equipamento_id BIGINT UNSIGNED NOT NULL,
  veiculo_id BIGINT UNSIGNED NOT NULL,
  garantia VARCHAR(20) NULL,
  data_instalacao DATE NOT NULL DEFAULT (CURRENT_DATE),
  data_retirada DATE NULL,
  PRIMARY KEY (equipamento_id, veiculo_id),
  UNIQUE KEY uq_equipamentos_veiculos_equipamento (equipamento_id),
  UNIQUE KEY uq_equipamentos_veiculos_veiculo (veiculo_id),
  KEY idx_equipamentos_veiculos_veiculo (veiculo_id),
  CONSTRAINT fk_equipamentos_veiculos_equipamento
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_equipamentos_veiculos_veiculo
    FOREIGN KEY (veiculo_id) REFERENCES veiculos (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_equipamentos_veiculos_periodo CHECK (
    data_retirada IS NULL OR data_retirada >= data_instalacao
  )
) ENGINE=InnoDB;

-- ============================================================
-- 9. LOCAÇÕES (UTILIZA)
-- ============================================================
-- Registra quem recebeu o item, qual veículo está relacionado e o
-- período da locação. Um registro deve apontar para equipamento OU
-- acessório; a aplicação deve validar essa regra antes de inserir.
-- O status "Locado" das tabelas de estoque deve ser sincronizado com
-- a existência de uma locação aberta.
CREATE TABLE IF NOT EXISTS locacoes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  equipamento_id BIGINT UNSIGNED NULL,
  acessorio_id BIGINT UNSIGNED NULL,
  cliente_id BIGINT UNSIGNED NOT NULL,
  veiculo_id BIGINT UNSIGNED NULL,
  iniciado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  encerrado_em DATETIME NULL,
  observacoes VARCHAR(500) NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_locacoes_abertas (encerrado_em),
  KEY idx_locacoes_cliente (cliente_id),
  CONSTRAINT fk_locacoes_equipamento
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_locacoes_acessorio
    FOREIGN KEY (acessorio_id) REFERENCES acessorios (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_locacoes_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_locacoes_veiculo
    FOREIGN KEY (veiculo_id) REFERENCES veiculos (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT chk_locacoes_item CHECK (
    (equipamento_id IS NOT NULL AND acessorio_id IS NULL)
    OR (equipamento_id IS NULL AND acessorio_id IS NOT NULL)
  ),
  CONSTRAINT chk_locacoes_periodo CHECK (
    encerrado_em IS NULL OR encerrado_em >= iniciado_em
  )
) ENGINE=InnoDB;

-- ============================================================
-- 10. HISTÓRICO DE STATUS
-- ============================================================
-- Mantém auditoria das alterações de status sem perder o histórico
-- quando um equipamento ou acessório é editado ou removido.
CREATE TABLE IF NOT EXISTS historico_status_estoque (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipo_item ENUM('Equipamento', 'Acessório') NOT NULL,
  item_id BIGINT UNSIGNED NOT NULL,
  status_anterior ENUM('Locado', 'Disponível', 'Em Manutenção') NULL,
  status_novo ENUM('Locado', 'Disponível', 'Em Manutenção') NOT NULL,
  usuario_id BIGINT UNSIGNED NULL,
  alterado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_historico_item (tipo_item, item_id, alterado_em),
  CONSTRAINT fk_historico_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 11. CONSULTAS DE RELAÇÃO NOS DOIS SENTIDOS
-- ============================================================
-- Permite mostrar em qual veículo um equipamento está instalado.
CREATE OR REPLACE VIEW vw_equipamentos_com_veiculos AS
SELECT
  e.id AS equipamento_id,
  e.numero_serie,
  e.tecnologia,
  e.modelo AS modelo_equipamento,
  e.status AS status_equipamento,
  v.id AS veiculo_id,
  v.placa,
  v.marca,
  v.modelo AS modelo_veiculo,
  v.ano,
  ev.garantia,
  ev.data_instalacao,
  ev.data_retirada
FROM equipamentos e
LEFT JOIN equipamentos_veiculos ev
  ON ev.equipamento_id = e.id
LEFT JOIN veiculos v
  ON v.id = ev.veiculo_id;

-- Permite mostrar qual equipamento está ligado a cada veículo.
CREATE OR REPLACE VIEW vw_veiculos_com_equipamentos AS
SELECT
  v.id AS veiculo_id,
  v.placa,
  v.marca,
  v.modelo AS modelo_veiculo,
  v.ano,
  e.id AS equipamento_id,
  e.numero_serie,
  e.tecnologia,
  e.modelo AS modelo_equipamento,
  e.status AS status_equipamento,
  ev.garantia,
  ev.data_instalacao,
  ev.data_retirada
FROM veiculos v
LEFT JOIN equipamentos_veiculos ev
  ON ev.veiculo_id = v.id
LEFT JOIN equipamentos e
  ON e.id = ev.equipamento_id;

-- ============================================================
-- 12. OPÇÕES INICIAIS DA INTERFACE
-- ============================================================
-- Valores que hoje ficam em equipamento-opcoes.json. INSERT IGNORE
-- permite reaplicar esta seção sem duplicar opções existentes.
INSERT IGNORE INTO opcoes_catalogo (categoria, valor, grupo) VALUES
  ('tecnologia', '2G', ''),
  ('tecnologia', '4G', ''),
  ('modelo_equipamento', 'RST - OBDII', ''),
  ('modelo_equipamento', 'RST - Mini LC', ''),
  ('modelo_equipamento', 'RST MINI - LC', ''),
  ('modelo_equipamento', 'RST Mini', ''),
  ('modelo_equipamento', 'RST LCv5', ''),
  ('modelo_equipamento', 'RST One', ''),
  ('modelo_equipamento', 'RST MÓVEL RF', ''),
  ('modelo_equipamento', 'RST ISCA GPS LORA', ''),
  ('modelo_equipamento', 'RST Plus', ''),
  ('modelo_equipamento', 'RST Híbrido', ''),
  ('modelo_equipamento', 'RST Micro', ''),
  ('modelo_equipamento', 'RST - Globalstar', ''),
  ('modelo_equipamento', 'NT40', ''),
  ('modelo_equipamento', 'NONOS-N4', ''),
  ('tipo_acessorio', 'Bloqueador', ''),
  ('tipo_acessorio', 'Leitor', ''),
  ('tipo_acessorio', 'Chaveiro', ''),
  ('modelo_acessorio', 'Relé de Bloqueio', 'Bloqueador'),
  ('modelo_acessorio', 'Ibutton', 'Leitor'),
  ('modelo_acessorio', 'Ibutton', 'Chaveiro');
