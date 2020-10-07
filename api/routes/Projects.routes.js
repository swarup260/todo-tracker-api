const Express = require('express');
const router = Express.Router();
const projectsController = require('../controllers/Projects.controller');
const columnController = require('../controllers/Projects/Column.controller');
const noteController = require('../controllers/Projects/Note.controller');
const checkAuth = require('../middlewares/CheckAuth.middleware');

/* Projects Route */

router.post('/', checkAuth, projectsController.addProject);
router.patch('/', checkAuth, projectsController.updateProject);
router.get('/:objectId?', checkAuth, projectsController.getProject);
router.delete('/:objectId', checkAuth, projectsController.deleteProject);

/* Column Route */

router.post('/column', checkAuth, columnController.addColumn);
router.get('/column/:projectId', checkAuth, columnController.getColumn);
router.patch('/column', checkAuth, columnController.updateColumn);
router.delete('/column/:projectId/:columnId', checkAuth, columnController.deleteColumn);

/* Note Route */
router.post('/note', checkAuth, noteController.addNote);
router.get('/note/:projectId/:noteId?', checkAuth, noteController.getNote);
router.patch('/note', checkAuth, noteController.updateNote);
router.delete('/note/:objectId', checkAuth, noteController.deleteNote);

module.exports = router;