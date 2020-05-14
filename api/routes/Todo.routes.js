const Express = require('express');
const router = Express.Router();
const todoController = require('../controllers/Todo.controller');
const checkAuth = require('../middlewares/CheckAuth.middleware');

router.post('/', checkAuth, todoController.addTodo);
router.patch('/', checkAuth, todoController.updateTodo);
router.get('/:objectId?', checkAuth, todoController.getTodo);
router.delete('/:objectId', checkAuth, todoController.deleteTodo);

module.exports =  router;