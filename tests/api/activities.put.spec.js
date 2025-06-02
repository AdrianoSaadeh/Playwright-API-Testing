import { test, expect } from "@playwright/test";

test.describe('Validações do endpoint PUT /api/v1/Activities/{id}', () => {

    let createdActivityId; // Variável para armazenar o ID da atividade criada para o teste

    // Hook `beforeAll` para criar uma atividade antes de todos os testes PUT
    // Isso garante que temos um recurso para atualizar.
    test.beforeAll(async ({ request }) => {
        const newActivity = {
            id: 31, // ID 0 para que a API gere um novo
            title: "Atividade Original para PUT",
            dueDate: "2025-07-01T09:00:00.000Z",
            completed: false
        };

        const response = await request.post(`api/v1/Activities`, {
            data: newActivity
        });
        const postResponse = await response.json();
        createdActivityId = postResponse.id; // Salva o ID da atividade criada
        console.log(`Atividade criada com ID para PUT: ${createdActivityId}`);
        expect(response.status()).toBe(200); // Garante que a criação inicial foi bem-sucedida
        expect(createdActivityId).toBeGreaterThan(0);
    });

    // Hook `afterAll` para "limpar" (opcional para APIs de teste como esta)
    // Em uma API real, você faria um DELETE aqui.
    test.afterAll(async ({ request }) => {
        // Para fakerestapi, não há endpoint DELETE para Activities.
        // Em uma API real: await request.delete(`${BASE_URL}/api/v1/Activities/${createdActivityId}`);
        console.log(`Testes PUT concluídos para o ID: ${createdActivityId}`);
    });

    test('Deve atualizar uma atividade existente e retornar status 200 OK com os dados atualizados', async ({ request }) => {
        // Dados para a atualização
        const updatedTitle = "Título da Atividade Atualizado via Playwright";
        const updatedDueDate = "2026-12-31T23:59:59.000Z";
        const updatedCompleted = true;

        const updatedActivityData = {
            id: createdActivityId, // MUITO IMPORTANTE: usar o ID do recurso existente
            title: updatedTitle,
            dueDate: updatedDueDate,
            completed: updatedCompleted
        };

        const response = await request.put(`api/v1/Activities/${createdActivityId}`, {
            data: updatedActivityData
        });

        // --- Validações da Resposta do PUT ---

        // 1. Validação do Status Code:
        expect(response.status()).toBe(200);

        // 2. Validação do Corpo da Resposta:
        const responseBody = await response.json();
        expect(responseBody).not.toBeNull();
        expect(Object.keys(responseBody).length).toBeGreaterThan(0);

        // 2.1. Validar Estrutura e Tipos de Dados
        expect(responseBody).toHaveProperty('id');
        expect(responseBody).toHaveProperty('title');
        expect(responseBody).toHaveProperty('dueDate');
        expect(responseBody).toHaveProperty('completed');
        expect(typeof responseBody.id).toBe('number');
        expect(typeof responseBody.title).toBe('string');
        expect(typeof responseBody.dueDate).toBe('string');
        expect(typeof responseBody.completed).toBe('boolean');

        // 2.2. Validar que os Dados Foram Atualizados Corretamente na Resposta
        expect(responseBody.id).toBe(createdActivityId); // O ID deve ser o mesmo
        expect(responseBody.title).toBe(updatedTitle);
        expect(responseBody.completed).toBe(updatedCompleted);

        // Comparação de datas - converta para ISO string para evitar problemas de fuso horário/formato
        const sentUpdatedDueDate = new Date(updatedDueDate).toISOString();
        const receivedUpdatedDueDate = new Date(responseBody.dueDate).toISOString();
        expect(receivedUpdatedDueDate).toBe(sentUpdatedDueDate);

        // --- Validação de Efeito Colateral (GET subsequente) ---
        // 3. Validação da Persistência: Fazer um GET para o ID atualizado para confirmar a mudança no "banco de dados"
        const getResponse = await request.get(`api/v1/Activities/${createdActivityId}`);
        expect(getResponse.status()).toBe(200);
        const fetchedActivity = await getResponse.json();

        // 3.1. Validar que o recurso obtido reflete as atualizações
        expect(fetchedActivity.id).toBe(createdActivityId);
        expect(fetchedActivity.title).toBe(updatedTitle);
        expect(fetchedActivity.completed).toBe(updatedCompleted);
        const fetchedDueDate = new Date(fetchedActivity.dueDate).toISOString();
        expect(fetchedDueDate).toBe(sentUpdatedDueDate);
    });

    // test('Deve retornar 404 Not Found ao tentar atualizar uma atividade inexistente', async ({ request }) => {
    //     const nonExistentId = 999999; // Um ID que com certeza não existe
    //     const dataForNonExistent = {
    //         id: nonExistentId,
    //         title: "Título Inexistente",
    //         dueDate: "2025-01-01T00:00:00.000Z",
    //         completed: false
    //     };

    //     const response = await request.put(`${BASE_URL}/api/v1/Activities/${nonExistentId}`, {
    //         data: dataForNonExistent
    //     });

    //     // 1. Validação do Status Code:
    //     // Para PUT em recurso inexistente, espera-se 404 Not Found (se a API não cria um novo)
    //     // O fakerestapi tem um comportamento peculiar aqui: ele vai criar um novo recurso se o ID não existir!
    //     // Se fosse uma API real onde PUT é estritamente para atualização, esperaria 404.
    //     // Como é fakerestapi, vamos esperar 200 OK (com o ID enviado, ou um novo ID gerado)
    //     // Então, para este cenário, vamos testar o que a API *faz*, não o que ela *deveria* fazer idealmente em um PUT restrito.
    //     // A implementação do fakerestapi para PUT é mais como um "upsert" (update or insert).
    //     expect(response.status()).toBe(200);
    //     const responseBody = await response.json();
    //     expect(responseBody.id).not.toBe(nonExistentId); // Provavelmente um novo ID foi gerado
    //     expect(responseBody.id).toBeGreaterThan(0); // Um novo ID foi criado

    //     // Se a API DEVESSE retornar 404 para ID inexistente, o teste seria assim:
    //     // expect(response.status()).toBe(404);
    //     // expect(responseBody).toHaveProperty('message'); // Ou outra propriedade de erro
    // });

    // test('Deve retornar 400 Bad Request ao enviar dados inválidos para atualização (ex: title vazio)', async ({ request }) => {
    //     const invalidUpdateData = {
    //         id: createdActivityId, // ID válido
    //         title: "", // Título inválido (geralmente vazio não permitido)
    //         dueDate: "2025-06-15T10:00:00.000Z",
    //         completed: true
    //     };

    //     const response = await request.put(`${BASE_URL}/api/v1/Activities/${createdActivityId}`, {
    //         data: invalidUpdateData
    //     });

    //     // 1. Validação do Status Code de Erro:
    //     expect(response.status()).toBe(400); // Esperamos 400 Bad Request

    //     // 2. Validação do Corpo da Resposta de Erro (se a API fornece detalhes):
    //     const errorBody = await response.json();
    //     expect(errorBody).toHaveProperty('errors');
    //     // Para esta API específica, ela pode não dar um erro detalhado para `title` vazio.
    //     // Em APIs reais, você buscaria mensagens de erro específicas, como:
    //     // expect(errorBody.errors.Title[0]).toContain('The Title field is required.');
    // });
});