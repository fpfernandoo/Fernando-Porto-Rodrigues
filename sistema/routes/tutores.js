// ============================================================
// routes/tutores.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊS (ALUNO DESENVOLVE).
//
// A estrutura de cada rota (o "molde" com try/catch/finally e a
// conexão com o banco) já está pronta, seguindo o mesmo padrão
// usado em routes/auth.js. O que falta em cada uma é a lógica
// específica (marcada com TODO).
//
// Lembretes importantes:
//   - Cada rota abaixo já vem protegida pelo middleware
//     verificarSessao (segundo parâmetro) - vocês não precisam
//     mexer nisso, só saber que é por isso que o sistema exige
//     login para usar essas rotas.
//   - O CPF do tutor deve ser CRIPTOGRAFADO ao salvar/atualizar, e
//     DESCRIPTOGRAFADO ao listar/exibir - use as funções prontas em
//     utils/crypto-utils.js (criptografarCPF / descriptografarCPF)
//
// Veja o GUIA_DE_DESENVOLVIMENTO.md para um roteiro passo a passo
// de cada uma dessas funcionalidades.
// ============================================================

import express from 'express';
import { criarCliente } from '../config/db.js';
import { criptografarCPF, descriptografarCPF } from '../utils/crypto-utils.js';
import { verificarSessao } from '../middleware/auth-middleware.js';

const router = express.Router();
// ─────────────────────────────────────────
// GET / -> listar tutores (RF-12)
// GET /?busca=termo -> listar tutores filtrados (RF-14)
// ─────────────────────────────────────────
router.get('/', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        // TODO: req.query.busca contém o termo digitado (se houver).
        // Monte a query de acordo: se não houver busca, traga todos
        // os tutores; se houver, filtre pelo nome.
        const termoBusca = req.query.busca;

        if (termoBusca) {
            
            const resultado = await client.query('SELECT * FROM tutores WHERE tutores.nome ORDER, BY, tutores.nome, ' [termoBusca]); // TODO: ajustar")
        } else {
            resultado = await client.query(`SELECT * FROM tutores ORDER BY nome `);
        }

        // TODO: antes de responder, percorra resultado.rows e troque
        // o campo "cpf" de cada tutor pelo valor descriptografado
        // (descriptografarCPF), senão o CPF aparece ilegível na tela.
        const tutores = resultado.rows.map((tutor) => ({
            cpf: tutor.cpf
                ? descriptografarCPF(tutor.cpf)
                : tutor.cpf
        }));
        res.json(tutores);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});
// ─────────────────────────────────────────
// POST / -> inserir novo tutor (RF-15)
// ─────────────────────────────────────────
router.post('/', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const { nome, cpf, telefone } = req.body;

        // TODO: validar campos obrigatórios (nome, cpf)

        // TODO: criptografar o CPF antes de salvar
        // const cpfCriptografado = criptografarCPF(cpf);

        // TODO: montar o INSERT usando client.query(...), com
        // RETURNING * para devolver o registro criado
        if (!nome || !cpf) {
            return res.status(400).json({ erro: 'Nome e CPF são obrigatórios.' });
        }
        const cpfCriptografado = criptografarCPF(cpf);

        const resultado = await client.query(`
            INSERT INTO tutores (nome, cpf, telefone)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [nome, cpf, telefone]);
        

        res.status(201).json({}); // TODO: substituir pelo registro criado
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ─────────────────────────────────────────
// PUT /:id -> editar tutor existente (RF-17)
// ─────────────────────────────────────────
router.put('/:id', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const { id } = req.params;
        const { nome, cpf, telefone } = req.body;
        cpfCriptografado = criptografarCPF(cpf);

        // TODO: criptografar o CPF recebido antes de atualizar

        // TODO: montar o UPDATE usando client.query(...), filtrando
        // por WHERE id = $... (use req.params.id)
        const resultado = await client.query(`
            UPDATE tutores
            SET nome = $1, cpf = $2, telefone = $3
            WHERE id = $4
            RETURNING *
        `, [nome, cpf, telefone, id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado.' });
        }

        res.json(resultado.rows[0]); // TODO: substituir pela confirmação/registro atualizado
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ─────────────────────────────────────────
// DELETE /:id -> excluir tutor (RF-13)
// ─────────────────────────────────────────
router.delete('/:id', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const { id } = req.params;

        // TODO: montar o DELETE usando client.query(...), filtrando
        // por WHERE id = $1
        const resultado = await client.query(
            'DELETE FROM tutores WHERE id = $1 RETURNING nome',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado.' });
        }

        res.json({ mensagem: 'Tutor removido com sucesso.' }); // ajuste se quiser
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

export default router;
