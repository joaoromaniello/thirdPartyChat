let currentUser = null;
const meuNome = "Eu";  // Nome que será usado para as mensagens enviadas por você
let pollingInterval = null;  // Variável para armazenar o intervalo de polling

const socket = io();


async function loadUsers() {
    try {
        const response = await fetch('/api/messages');
        
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const messages = await response.json();
        
        // Verificar se a resposta é um array
        if (!Array.isArray(messages)) {
            throw new Error('A resposta não é um array');
        }

        // Extração de usuários com base nas mensagens
        const users = [...new Set(messages.map(message => message.user === meuNome ? message.to : message.user))];
        
        const userList = document.getElementById('user-list');
        userList.innerHTML = ''; // Limpar lista de usuários anterior

        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user;
            li.addEventListener('click', () => {
                selectUser(user);
            });
            userList.appendChild(li);
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

function selectUser(user) {
    currentUser = user;
    document.getElementById('chat-username').textContent = user;

    const userItems = document.querySelectorAll('#user-list li');
    userItems.forEach(item => item.classList.remove('active'));

    event.target.classList.add('active');

    loadMessages(user);

    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    pollingInterval = setInterval(() => {
        loadMessages(user); 
    }, 3000);
}


async function loadMessages(user) {
    try {
        const response = await fetch(`/api/messages?user=${meuNome}&to=${user}`);
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar mensagens: ${response.status}`);
        }

        const messages = await response.json();

        const messageList = document.getElementById('message-list');
        messageList.innerHTML = ''; // Limpar mensagens anteriores

        messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            
            if (message.user === meuNome) {
                // Mensagens enviadas por você
                messageDiv.classList.add('sent');
            } else {
                // Mensagens recebidas
                messageDiv.classList.add('received');
            }

            messageDiv.innerHTML = `<strong>${message.user}</strong>: ${message.message}`;
            messageList.appendChild(messageDiv);
        });
    } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
    }
}


async function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value;

    if (!currentUser || !message) {
        alert('Por favor, selecione um usuário e digite uma mensagem.');
        return;
    }

    const newMessage = {
        user: meuNome,
        to: currentUser,
        message
    };


    socket.emit('message', newMessage);


    await fetch('/api/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMessage)
    });

    messageInput.value = ''; 
}


function startPolling(user) {
    pollingInterval = setInterval(() => {
        loadMessages(user); 
    }, 3000); 
}

socket.on('message', (data) => {
    if (data.user === currentUser || data.to === currentUser) {
        loadMessages(currentUser);
    }
});


loadUsers();
