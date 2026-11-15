#!/bin/bash
# Roda só com o volume vazio (LLD, seção 10). Senhas iguais ao nome do usuário, só locais.
# Cada banco tem um dono de mesmo nome, e nenhum usuário conecta num banco que não é o seu.
# business_readonly só conecta no business e só lê (ADR 0013).
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<-'SQL'
	CREATE ROLE chat LOGIN PASSWORD 'chat';
	CREATE ROLE agents LOGIN PASSWORD 'agents';
	CREATE ROLE business LOGIN PASSWORD 'business';
	CREATE ROLE business_readonly LOGIN PASSWORD 'business_readonly';
	ALTER ROLE business_readonly SET default_transaction_read_only = on;

	CREATE DATABASE chat OWNER chat;
	-- Banco das suítes e2e e de integração da API do chat; o globalSetup zera o schema dele.
	CREATE DATABASE chat_test OWNER chat;
	CREATE DATABASE agents OWNER agents;
	CREATE DATABASE business OWNER business;

	-- Por padrão qualquer usuário conecta em qualquer banco; o dono continua conectando.
	REVOKE CONNECT, TEMPORARY ON DATABASE chat, chat_test, agents, business, postgres FROM PUBLIC;
	GRANT CONNECT ON DATABASE business TO business_readonly;
SQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname business <<-'SQL'
	GRANT USAGE ON SCHEMA public TO business_readonly;
	GRANT SELECT ON ALL TABLES IN SCHEMA public TO business_readonly;
	-- Vale também para as tabelas que o script de carga criar depois, como business.
	ALTER DEFAULT PRIVILEGES FOR ROLE business IN SCHEMA public
		GRANT SELECT ON TABLES TO business_readonly;
SQL
