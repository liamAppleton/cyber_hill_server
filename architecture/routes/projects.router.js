const {
    getProjects,
    getProjectById,
    postProject,
    patchProject,
    patchProjectStatus,
    deleteProject,
    getProjectNotesById,
    postProjectNote,
    getRelationshipsByProjectId
} = require('../controllers');

const projectsRouter = require('express').Router();

projectsRouter.route('/')
    .get(getProjects)
    .post(postProject)

projectsRouter.route('/:project_id')
    .get(getProjectById)
    .patch(patchProject)
    .delete(deleteProject)

projectsRouter.route('/:project_id/status')
    .patch(patchProjectStatus)

projectsRouter.route('/:project_id/notes')
    .get(getProjectNotesById)
    .post(postProjectNote)

projectsRouter.route('/:project_id/relationships')
    .get(getRelationshipsByProjectId)

module.exports = projectsRouter;