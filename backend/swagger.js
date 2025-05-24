import swaggerAutogen from 'swagger-autogen';

const document = {
    info:{
        title: 'FastFoodPMW',
        description: 'FFPMW REST API',
        version: '1.0.0'
    },
    host: 'localhost:3001',
    schemes: ['http', 'https']
};

const endopoitFile = ['./server.js'];
const outputFile = './swagger.json';

swaggerAutogen(outputFile, endopoitFile, document).then(async () => {
    await import('./server.js');
});