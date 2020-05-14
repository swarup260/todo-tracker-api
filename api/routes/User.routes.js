const Express = require('express');
const router = Express.Router();
const userController = require('../controllers/User.controller');
const checkAuth = require('../middlewares/CheckAuth.middleware');


router.post('/register', userController.registerUser);
router.post('/login', userController.login);
router.patch('/',checkAuth ,userController.updateUser);
router.get('/:objectId?',checkAuth ,userController.getUser);
router.delete('/:objectId',checkAuth ,userController.deleteUser);

module.exports = router;