import { test, expect } from "@playwright/test";

test.describe("Validações do endpoint POST /api/v1/Activities", () => {

    test("Deve criar uma nova atividade e retornar status 200 OK com os dados corretos", async ({ request }) => {
        const newActivity = {
            title: "Activity 30",
            dueDate: 1748890712, // Data futura para teste
            completed: false
        };

        const postResponse = await request.post("activities", {
            data: newActivity
        });

        // --- Validações da Resposta do POST ---

        // 1. Validação do Status Code:
        // Para POSTs bem-sucedidos, esperamos geralmente 200 OK ou 201 Created.
        // Esta API específica retorna 200 OK para criação.
        expect(postResponse.status()).toBe(201);

        // 2. Validação do Corpo da Resposta (Payload Retornado):
        const responseBody = await postResponse.json();

        // 2.1. Validar que a resposta não é nula/vazia
        expect(responseBody).not.toBeNull();
        expect(Object.keys(responseBody).length).toBeGreaterThan(0);

        // 2.2. Validar a Estrutura do Objeto Retornado:
        // Garante que todas as propriedades esperadas estão presentes
        expect(responseBody).toHaveProperty("id");
        expect(responseBody).toHaveProperty("title");
        expect(responseBody).toHaveProperty("dueDate");
        expect(responseBody).toHaveProperty("completed");

        // 2.3. Validar Tipos de Dados das Propriedades Retornadas:
        // Garante que os tipos estão corretos
        expect(typeof responseBody.id).toBe("string");
        expect(typeof responseBody.title).toBe("string");
        expect(typeof responseBody.dueDate).toBe("number");
        expect(typeof responseBody.completed).toBe("boolean");

        // 2.4. Validar os Valores das Propriedades Criadas:
        // Muito importante: Verifica se os dados que enviamos foram refletidos na criação
        // O ID é gerado pela API, então apenas verificamos que é um número positivo
        expect(Number(responseBody.id)).toBeGreaterThan(40);
        expect(responseBody.title).toBe(newActivity.title);
        expect(responseBody.completed).toBe(newActivity.completed);

        // Para `dueDate`, a API pode retornar com um fuso horário ou formato ligeiramente diferente.
        // É mais seguro comparar as datas após convertê-las.
        const sentDueDate = new Date(newActivity.dueDate).toISOString();
        const receivedDueDate = new Date(responseBody.dueDate).toISOString();
        expect(receivedDueDate).toBe(sentDueDate);

        // 3. Validação de Efeitos Colaterais (Opcional, mas Recomendado):
        // Em um cenário real, após criar um recurso, você faria um GET para o ID recém-criado
        // para garantir que o recurso foi persistido no banco de dados.
        // Para esta API, como não há persistência real, é mais um conceito.
        const getResponse = await request.get(`activities/${responseBody.id}`);

        expect(getResponse.status()).toBe(200); // Garante que é possível buscar o recurso recém-criado
        const fetchedActivity = await getResponse.json();
        console.log(fetchedActivity);

        expect(fetchedActivity.id).toBe(responseBody.id);
        expect(fetchedActivity.title).toBe(newActivity.title);
    });

    test.skip("Deve retornar erro 400 Bad Request ao enviar dados inválidos (ex: title vazio)", async ({ request }) => {
        const invalidActivity = {
            title: 123,
            dueDate: "", // Data vazia 
            completed: false
        };

        const response = await request.post(`activities`, {
            data: invalidActivity
        });

        // 1. Validação do Status Code de Erro:
        expect(response.status()).toBe(400); // Esperamos um 400 Bad Request para dados inválidos

        // 2. Validação do Corpo da Resposta de Erro (se a API fornece mensagens de erro):
        const errorBody = await response.json();
        expect(errorBody).toHaveProperty("errors");
        expect(typeof errorBody.errors).toBe("object");
        expect(errorBody.title).toContain("One or more validation errors occurred.");

        const allErrors = Object.values(errorBody.errors).flat();
        const found = allErrors.some(msg => msg.includes("The JSON value could not be converted to System.DateTime"));
        expect(found).toBeTruthy();
    });

});