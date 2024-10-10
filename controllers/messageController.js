const Message = require('../models/message');


exports.createMessage = async (req, res) => {
    const { user, to, message } = req.body;

    if (!user || !to || !message) {
        return res.status(400).json({ error: 'Remetente, destinatário e mensagem são obrigatórios' });
    }

    try {
        const newMessage = new Message({ user, to, message });
        await newMessage.save();
        res.status(201).json({ success: 'Mensagem armazenada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar mensagem' });
    }
};

// Buscar mensagens entre o remetente e destinatário
exports.getMessages = async (req, res) => {
    const { user, to } = req.query;

    let query = {};
    
    if (user && to) {
        query = {
            $or: [
                { user: user, to: to },
                { user: to, to: user }
            ]
        };
    }

    try {
        const messages = await Message.find(query).sort({ timestamp: 1 });
        res.json(messages || []);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
};
