const {
    fetchProjects,
    fetchProjectById,
    addProject,
    updateProject,
    updateProjectStatus,
    removeProject,
    fetchProjectNotesById,
    addProjectNote,
    fetchRelationshipsByProjectId
} = require('../models');

const handleError = (err, res, next) => {
    if (err?.status) return res.status(err.status).send({ error: err.message });
    if (err?.code === 'ER_DUP_ENTRY') return res.status(409).send({ error: 'A project with that title already exists.' });
    if (err?.code === 'ER_NO_REFERENCED_ROW_2') return res.status(404).send({ error: 'Project not found.' });
    return next(err);
};

const notFound = (res) => res.status(404).send({ error: 'Project not found.' });

const getProjects = (req, res, next) => {
    fetchProjects()
        .then((projects) => res.status(200).send({ projects }))
        .catch(next);
};

const getProjectById = (req, res, next) => {
    fetchProjectById(req.params.project_id)
        .then((project) => (project ? res.status(200).send({ project }) : notFound(res)))
        .catch(next);
};

const postProject = (req, res, next) => {
    addProject(req.body)
        .then((project) => res.status(201).send({ project }))
        .catch((err) => handleError(err, res, next));
};

const patchProject = (req, res, next) => {
    updateProject(req.params.project_id, req.body)
        .then((project) => (project ? res.status(200).send({ project }) : notFound(res)))
        .catch((err) => handleError(err, res, next));
};

const patchProjectStatus = (req, res, next) => {
    updateProjectStatus(req.params.project_id, req.body?.status)
        .then((project) => (project ? res.status(200).send({ project }) : notFound(res)))
        .catch((err) => handleError(err, res, next));
};

const deleteProject = (req, res, next) => {
    removeProject(req.params.project_id)
        .then((affected) => (affected ? res.status(204).send() : notFound(res)))
        .catch(next);
};

const getProjectNotesById = (req, res, next) => {
    fetchProjectNotesById(req.params.project_id)
        .then((project_notes) => res.status(200).send({ project_notes }))
        .catch(next);
};

const postProjectNote = (req, res, next) => {
    addProjectNote(req.params.project_id, req.body?.body, req.user.user_id)
        .then((project_note) => res.status(201).send({ project_note }))
        .catch((err) => handleError(err, res, next));
};

const getRelationshipsByProjectId = (req, res, next) => {
    fetchRelationshipsByProjectId(req.params.project_id)
        .then((project_relationship_records) => res.status(200).send({ project_relationship_records }))
        .catch(next);
};

module.exports = {
    getProjects,
    getProjectById,
    postProject,
    patchProject,
    patchProjectStatus,
    deleteProject,
    getProjectNotesById,
    postProjectNote,
    getRelationshipsByProjectId
};
