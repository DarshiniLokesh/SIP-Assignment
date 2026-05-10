const express = require('express');
const router = express.Router();
const sipsController = require('../controllers/sipsController');

router.post('/', sipsController.registerSip);
router.get('/:sipId', sipsController.getSip);
router.post('/:sipId/process', sipsController.processSip);
router.get('/:sipId/transactions', sipsController.getSipTransactions);

module.exports = router;
