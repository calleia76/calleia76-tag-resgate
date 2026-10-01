-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "identificador" TEXT,
    "cargo" TEXT,
    "organizacao" TEXT,
    "foto" TEXT,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "tipoSanguineo" TEXT,
    "planoSaude" TEXT,
    "operadoraSaude" TEXT,
    "numeroCarteirinha" TEXT,
    "condicaoSaude" TEXT,
    "telefoneEmergencia" TEXT,
    "contatoEmergencia" TEXT,
    "medicamentosContinuo" TEXT,
    "descricaoMedicamentos" TEXT,
    "alergiasConhecidas" TEXT,
    "descricaoAlergia" TEXT,
    "observacoesMedicas" TEXT,
    "camposPrivados" TEXT NOT NULL DEFAULT '[]',
    "emergenciaToken" TEXT NOT NULL,
    "resetCodigoHash" TEXT,
    "resetExpiraEm" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "ultimoLoginEm" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_emergenciaToken_key" ON "Usuario"("emergenciaToken");
