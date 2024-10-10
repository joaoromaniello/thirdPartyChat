const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const messageRoutes = require('./routes/messageRoutes');
const path = require('path');

// Conectar ao banco de dados
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware para processar JSON
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Usar as rotas de mensagens
app.use('/api', messageRoutes);

// WebSocket: Escutar eventos de conexão
io.on('connection', (socket) => {
    console.log('Novo cliente conectado');

    // Escutar mensagens enviadas pelo cliente e propagar para todos
    socket.on('message', (data) => {
        console.log('Mensagem recebida: ', data);
        io.emit('message', data); // Propaga a mensagem para todos os clientes conectados
    });

    // Evento de desconexão
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const port = 3000;
server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
