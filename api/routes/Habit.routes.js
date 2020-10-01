const Express = require('express');
const router = Express.Router();
const habitController = require('../controllers/Habit.controller');
const checkAuth = require('../middlewares/CheckAuth.middleware');

router.post('/', checkAuth, habitController.addHabit);
router.post('/routinestatus', checkAuth, habitController.addRoutineStatus);
router.patch('/', checkAuth, habitController.updateHabit);
router.get('/timeline/:objectId?', checkAuth, habitController.getHabitTimeline);
router.get('/:objectId?', checkAuth, habitController.getHabit);
router.delete('/:objectId', checkAuth, habitController.deleteHabit);

module.exports =  router;