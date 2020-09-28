const Express = require('express');
const router = Express.Router();
const projectsController = require('../controllers/Projects.controller');
const checkAuth = require('../middlewares/CheckAuth.middleware');

router.post('/', checkAuth, projectsController.addProject);
router.post('/addColumns', checkAuth, projectsController.addColumns);
router.post('/addNote', checkAuth, projectsController.addNote);
router.patch('/', checkAuth, projectsController.updateProject);
router.get('/:objectId?', checkAuth, projectsController.getProject);
router.delete('/:objectId', checkAuth, projectsController.deleteProject);

module.exports =  router;