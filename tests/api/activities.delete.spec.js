import { test, expect } from '@playwright/test';

test.describe('Validações do endpoint DELETE /api/v1/activities/{id}', () => {

    let createdActivityId; // Variável para armazenar o ID da atividade criada

    // Hook `beforeAll` para criar uma atividade antes de todos os testes DELETE
    test.beforeAll(async ({ request }) => {
        const newActivity = {
            title: "Activity to be deleted",
            dueDate: 1748891512, // Usando timestamp atual em ms
            completed: false
        };

        console.log(newActivity.dueDate);
        const response = await request.post('activities', {
            data: newActivity
        });
        const responsePost = await response.json();
        createdActivityId = responsePost.id;

        console.log(`Atividade criada para exclusão com ID: ${createdActivityId}`);
        expect(response.status()).toBe(201);
        expect(typeof createdActivityId).toBe('string');
    });

    // Teste 1: Exclusão bem-sucedida de um recurso existente
    test('Deve excluir uma atividade existente e retornar status 200 OK', async ({ request }) => {
        // 1. Enviar requisição DELETE para o recurso criado
        const deleteResponse = await request.delete(`activities/${createdActivityId}`);

        // Validação 1.1: Status Code de Sucesso
        expect(deleteResponse.status()).toBe(200); // mockapi.io retorna 200 OK para DELETE bem-sucedido

        // Validação 1.2: Corpo da Resposta (se houver)
        const deletedActivity = await deleteResponse.json();
        expect(deletedActivity).toHaveProperty('id', createdActivityId);
        expect(deletedActivity).toHaveProperty('title', 'Activity to be deleted'); // Confirma que o objeto retornado é o correto

        // 2. Validação da Persistência: Tentar buscar o recurso recém-excluído
        const getResponseAfterDelete = await request.get(`activities/${createdActivityId}`);

        // Validação 2.1: Status Code de "Não Encontrado"
        expect(getResponseAfterDelete.status()).toBe(404);

        // Validação 2.2: Corpo da Resposta de "Não Encontrado" (se houver mensagem de erro)
        const errorBody = await getResponseAfterDelete.json(); // mockapi.io retorna objeto vazio para 404
        expect(errorBody).toEqual("Not found");
    });

    // Teste 2: Tentar excluir um recurso que não existe
    test('Deve retornar 404 Not Found ao tentar excluir uma atividade inexistente', async ({ request }) => {
        const nonExistentId = '999'; // Um ID que com certeza não existe neste mock

        const response = await request.delete(`activities/${nonExistentId}`);

        // Validação 1: Status Code de "Não Encontrado"
        expect(response.status()).toBe(404);

        // Validação 2: Corpo da Resposta de Erro (se a API fornece detalhes)
        const errorBody = await response.json();
        expect(errorBody).toEqual("Not found");
    });

    // Hook `afterAll` para limpeza (opcional para testes, mas boa prática em ambientes reais)
    // Neste caso, a atividade criada já foi excluída no primeiro teste, então este hook é mais conceitual.
    test.afterAll(async () => {
        console.log('Testes DELETE concluídos.');
    });
});