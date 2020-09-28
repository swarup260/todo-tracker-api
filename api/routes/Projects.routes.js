const Express = require('express');
const router = Express.Router();
const projectsController = require('../controllers/Projects.controller');
const checkAuth = require('../middlewares/CheckAuth.middleware');

/* Projects Route */

router.post('/', checkAuth, projectsController.addProject);
router.patch('/', checkAuth, projectsController.updateProject);
router.get('/:objectId?', checkAuth, projectsController.getProject);
router.delete('/:objectId', checkAuth, projectsController.deleteProject);

/* Column Route */

router.post('/column', checkAuth, projectsController.addColumn);
router.patch('/column', checkAuth, projectsController.updateColumn);
router.delete('/column', checkAuth, projectsController.deleteColumn);

/* Note Route */
router.post('/note', checkAuth, projectsController.addNote);
router.patch('/note', checkAuth, projectsController.updateNote);
router.delete('/note', checkAuth, projectsController.updateNote);

module.exports = router;