const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const {
  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination
} = require('../controllers/destination.controller');

router.use(protect);

router.get('/',       getDestinations);
router.post('/',      addDestination);
router.put('/:id',    updateDestination);
router.delete('/:id', deleteDestination);

module.exports = router;