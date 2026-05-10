const express = require('express');
const router = express.Router();
const fundsController = require('../controllers/fundsController');

router.post('/', fundsController.createFund);
router.get('/', fundsController.getFunds);
router.put('/:fundId/nav', fundsController.updateNav);

module.exports = router;
