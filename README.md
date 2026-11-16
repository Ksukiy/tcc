# Hermes - Gerenciador de Estoque

## 1. Sobre o projeto

Este software foi desenvolvido para a empresa **RJ Soluções em rastreamento veicular**, com o objetivo de realizar o gerenciamento e controle do estoque de rastreadores, facilitando o acompanhamento dos equipamentos e a organização das informações.

O sistema utiliza **Node.js** para execução da aplicação e **MySQL** como banco de dados para armazenamento das informações.

## 2. Pré-requisitos

Antes de iniciar a instalação, é necessário possuir os seguintes programas:

- **Node.js:** necessário para executar a aplicação.
- **MySQL:** banco de dados utilizado pelo sistema.
- **Editor de código:** recomendado Visual Studio Code (opcional).

### Download dos programas

- Node.js: https://nodejs.org/
- MySQL: https://dev.mysql.com/downloads/installer/

Recomenda-se instalar a versão LTS do Node.js.

## 3. Instalação do projeto

Após baixar ou clonar o projeto, abra a pasta no terminal e execute o comando:

```bash
npm install
```

Esse comando instalará todas as dependências necessárias para o funcionamento do sistema.

## 4. Configuração do banco de dados

O sistema utiliza o banco de dados MySQL.

Primeiramente, é necessário instalar e iniciar o MySQL. Em seguida, crie o banco de dados que será utilizado pela aplicação, conforme a configuração esperada pelo projeto.

Caso o projeto possua um arquivo SQL para criação das tabelas, execute-o no MySQL antes de iniciar o sistema.

## 5. Configuração do arquivo .env

Na pasta principal do projeto, crie um arquivo chamado **.env**.

Esse arquivo será responsável por armazenar as informações de conexão com o banco de dados e outras configurações necessárias para a execução do sistema.

Exemplo de configuração:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco

PORT=3000
```

**Importante:**
- Altere os valores conforme as configurações do seu ambiente.
- Informe o usuário e a senha corretos do MySQL.
- O nome do banco de dados deve corresponder ao banco criado anteriormente.
- Não compartilhe o arquivo `.env`, pois ele contém informações de acesso ao banco de dados.

## 6. Executando o sistema

Após instalar as dependências e configurar o arquivo `.env`, execute o comando abaixo no terminal:

```bash
npm start
```

Caso o projeto utilize outro comando de inicialização, consulte a configuração disponível no arquivo `package.json`.

Se tudo estiver configurado corretamente, o sistema será iniciado e estará pronto para utilização.

## 7. Observações

- Mantenha o Node.js e o MySQL instalados e atualizados.
- Verifique se o serviço do MySQL está ativo antes de iniciar o sistema.
- Confira as informações do arquivo `.env` caso ocorra algum erro de conexão.
- Não exclua os arquivos de configuração ou dependências do projeto.
- Realize backups periódicos do banco de dados para evitar perda de informações.
