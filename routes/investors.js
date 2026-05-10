const express = require('express');
const router = express.Router();
const investorsController = require('../controllers/investorsController');

router.post('/', investorsController.createInvestor);
router.get('/', investorsController.getAllInvestors);
router.get('/:investorId', investorsController.getInvestor);
router.get('/:investorId/holdings', investorsController.getHoldings);
router.get('/:investorId/networth', investorsController.getNetworth);

module.exports = router;
