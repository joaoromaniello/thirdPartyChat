const express = require('express');
const router = express.Router();
const { createMessage, getMessages } = require('../controllers/messageController');

router.post('/messages', createMessage);

router.get('/messages', getMessages);

router.delete('/messages/reset', async (req, res) => {
    try {
        await Message.deleteMany({});
        res.json({ success: 'Banco de dados resetado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao resetar o banco de dados' });
    }
});

module.exports = router;
